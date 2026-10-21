import { Op } from 'sequelize';
import sequelize from '../config/database.js';
import { Order, OrderItem, Product, Business, Payment } from '../database/models/index.js';
import { ApiError } from '../utils/apiError.js';
import { ROLES } from '../constants/roles.js';
import { ORDER_STATUS, PAYMENT_STATUS } from '../constants/orderStatus.js';
import { PAYMENT_METHODS, PAYMENT_TRANSACTION_STATUS, COD_STATUS } from '../constants/paymentStatus.js';

/**
 * Resolves date boundaries for current and comparison periods
 */
function resolveDatePeriods(range = '7d', customStart = null, customEnd = null, referenceDate = new Date()) {
  const now = referenceDate instanceof Date && !isNaN(referenceDate) ? referenceDate : new Date();

  let currentStart, currentEnd;
  let prevStart, prevEnd;
  let defaultGranularity = 'daily';

  switch (range) {
    case 'today': {
      currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      currentEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

      prevStart = new Date(currentStart);
      prevStart.setDate(prevStart.getDate() - 1);
      prevEnd = new Date(currentEnd);
      prevEnd.setDate(prevEnd.getDate() - 1);

      defaultGranularity = 'hourly';
      break;
    }

    case 'yesterday': {
      currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0, 0);
      currentEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);

      prevStart = new Date(currentStart);
      prevStart.setDate(prevStart.getDate() - 1);
      prevEnd = new Date(currentEnd);
      prevEnd.setDate(prevEnd.getDate() - 1);

      defaultGranularity = 'hourly';
      break;
    }

    case '7d': {
      currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0, 0);
      currentEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

      prevStart = new Date(currentStart);
      prevStart.setDate(prevStart.getDate() - 7);
      prevEnd = new Date(currentStart.getTime() - 1);

      defaultGranularity = 'daily';
      break;
    }

    case '30d': {
      currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29, 0, 0, 0, 0);
      currentEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

      prevStart = new Date(currentStart);
      prevStart.setDate(prevStart.getDate() - 30);
      prevEnd = new Date(currentStart.getTime() - 1);

      defaultGranularity = 'daily';
      break;
    }

    case 'this_month': {
      currentStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      currentEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

      prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      const prevMonthLastDay = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
      const targetDay = Math.min(now.getDate(), prevMonthLastDay);
      prevEnd = new Date(now.getFullYear(), now.getMonth() - 1, targetDay, 23, 59, 59, 999);

      defaultGranularity = 'daily';
      break;
    }

    case 'last_month': {
      currentStart = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      currentEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

      prevStart = new Date(now.getFullYear(), now.getMonth() - 2, 1, 0, 0, 0, 0);
      prevEnd = new Date(now.getFullYear(), now.getMonth() - 1, 0, 23, 59, 59, 999);

      defaultGranularity = 'daily';
      break;
    }

    case 'custom': {
      const cStart = customStart ? new Date(customStart) : new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
      const cEnd = customEnd ? new Date(customEnd) : new Date();

      currentStart = new Date(cStart.getFullYear(), cStart.getMonth(), cStart.getDate(), 0, 0, 0, 0);
      currentEnd = new Date(cEnd.getFullYear(), cEnd.getMonth(), cEnd.getDate(), 23, 59, 59, 999);

      const spanMs = currentEnd.getTime() - currentStart.getTime();
      prevStart = new Date(currentStart.getTime() - spanMs - 1);
      prevEnd = new Date(currentStart.getTime() - 1);

      const days = Math.max(1, Math.round(spanMs / (1000 * 60 * 60 * 24)));
      if (days <= 2) defaultGranularity = 'hourly';
      else if (days <= 45) defaultGranularity = 'daily';
      else if (days <= 120) defaultGranularity = 'weekly';
      else defaultGranularity = 'monthly';
      break;
    }

    default: {
      currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0, 0);
      currentEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

      prevStart = new Date(currentStart);
      prevStart.setDate(prevStart.getDate() - 7);
      prevEnd = new Date(currentStart.getTime() - 1);

      defaultGranularity = 'daily';
    }
  }

  return {
    currentStart,
    currentEnd,
    prevStart,
    prevEnd,
    defaultGranularity
  };
}

/**
 * Calculates key financial metrics for a collection of orders
 */
function calculatePeriodMetrics(orders) {
  let grossSales = 0;
  let totalDiscounts = 0;
  let refundAmount = 0;
  let netSales = 0;
  let verifiedCollections = 0;
  let codPendingCollection = 0;
  let validOrdersCount = 0;
  const statusCounts = {};

  for (const order of orders) {
    const status = order.status;
    statusCounts[status] = (statusCounts[status] || 0) + 1;

    const isCancelledOrRefunded =
      [ORDER_STATUS.CANCELLED, ORDER_STATUS.REFUNDED, ORDER_STATUS.RETURNED].includes(status) ||
      order.paymentStatus === PAYMENT_STATUS.REFUNDED;

    const subtotal = parseFloat(order.subtotal || 0);
    const discount = parseFloat(order.discountAmount || 0);
    const total = parseFloat(order.totalAmount || 0);

    if (isCancelledOrRefunded) {
      refundAmount += total;
    } else {
      grossSales += subtotal;
      totalDiscounts += discount;
      netSales += total;
      validOrdersCount += 1;
    }

    // Payment collection status calculation
    const payment = order.payment;
    if (payment) {
      const isCod = payment.paymentMethod === PAYMENT_METHODS.CASH_ON_DELIVERY;
      const paymentAmount = parseFloat(payment.amount || total);

      if (!isCod) {
        // Online payments: Razorpay, Card, UPI, etc.
        const isPaid =
          order.paymentStatus === PAYMENT_STATUS.PAID ||
          payment.status === PAYMENT_TRANSACTION_STATUS.COMPLETED;
        if (isPaid && !isCancelledOrRefunded) {
          verifiedCollections += paymentAmount;
        }
      } else {
        // COD payments
        if (payment.codStatus === COD_STATUS.COLLECTED) {
          verifiedCollections += paymentAmount;
        } else if (payment.codStatus === COD_STATUS.PENDING && !isCancelledOrRefunded) {
          codPendingCollection += paymentAmount;
        }
      }
    } else {
      // Fallback if payment record not yet attached
      if (order.paymentStatus === PAYMENT_STATUS.PAID && !isCancelledOrRefunded) {
        verifiedCollections += total;
      }
    }
  }

  const averageOrderValue = validOrdersCount > 0 ? netSales / validOrdersCount : 0;

  return {
    grossSales: Number(grossSales.toFixed(2)),
    discountAmount: Number(totalDiscounts.toFixed(2)),
    refundAmount: Number(refundAmount.toFixed(2)),
    netSales: Number(netSales.toFixed(2)),
    verifiedCollections: Number(verifiedCollections.toFixed(2)),
    codPendingCollection: Number(codPendingCollection.toFixed(2)),
    totalOrders: validOrdersCount,
    allOrdersCount: orders.length,
    averageOrderValue: Number(averageOrderValue.toFixed(2)),
    statusCounts
  };
}

/**
 * Generates zero-filled intervals for chart series
 */
function buildIntervalBuckets(granularity, currentStart, currentEnd, prevStart, prevEnd) {
  const buckets = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (granularity === 'hourly') {
    // 24 hours (00:00 to 23:00)
    for (let h = 0; h < 24; h++) {
      const hourStr = String(h).padStart(2, '0') + ':00';
      const displayHour = h % 12 === 0 ? 12 : h % 12;
      const ampm = h < 12 ? 'AM' : 'PM';
      buckets.push({
        key: hourStr,
        label: `${displayHour} ${ampm}`,
        fullDate: `Today, ${hourStr}`,
        hour: h,
        netSales: 0,
        grossSales: 0,
        orderCount: 0,
        comparisonSales: 0,
        comparisonOrderCount: 0,
        comparisonLabel: `Yesterday, ${hourStr}`
      });
    }
    return buckets;
  }

  if (granularity === 'weekly') {
    let cur = new Date(currentStart);
    let prev = new Date(prevStart);
    let index = 1;

    while (cur <= currentEnd) {
      const weekEnd = new Date(cur.getTime() + 6 * 24 * 60 * 60 * 1000);
      const effectiveWeekEnd = weekEnd > currentEnd ? currentEnd : weekEnd;

      const pWeekEnd = new Date(prev.getTime() + 6 * 24 * 60 * 60 * 1000);
      const effectivePWeekEnd = pWeekEnd > prevEnd ? prevEnd : pWeekEnd;

      buckets.push({
        key: `W${index}_${cur.toISOString().slice(0, 10)}`,
        label: `Wk ${index}`,
        fullDate: `${monthNames[cur.getMonth()]} ${cur.getDate()} - ${monthNames[effectiveWeekEnd.getMonth()]} ${effectiveWeekEnd.getDate()}`,
        startDate: new Date(cur),
        endDate: new Date(effectiveWeekEnd),
        prevStartDate: new Date(prev),
        prevEndDate: new Date(effectivePWeekEnd),
        netSales: 0,
        grossSales: 0,
        orderCount: 0,
        comparisonSales: 0,
        comparisonOrderCount: 0,
        comparisonLabel: `${monthNames[prev.getMonth()]} ${prev.getDate()} - ${monthNames[effectivePWeekEnd.getMonth()]} ${effectivePWeekEnd.getDate()}`
      });

      cur = new Date(effectiveWeekEnd.getTime() + 24 * 60 * 60 * 1000);
      prev = new Date(effectivePWeekEnd.getTime() + 24 * 60 * 60 * 1000);
      index++;
    }
    return buckets;
  }

  if (granularity === 'monthly') {
    let cur = new Date(currentStart.getFullYear(), currentStart.getMonth(), 1);
    let prev = new Date(prevStart.getFullYear(), prevStart.getMonth(), 1);

    while (cur <= currentEnd) {
      const monthEnd = new Date(cur.getFullYear(), cur.getMonth() + 1, 0, 23, 59, 59, 999);
      const pMonthEnd = new Date(prev.getFullYear(), prev.getMonth() + 1, 0, 23, 59, 59, 999);

      buckets.push({
        key: `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}`,
        label: `${monthNames[cur.getMonth()]} '${String(cur.getFullYear()).slice(-2)}`,
        fullDate: `${monthNames[cur.getMonth()]} ${cur.getFullYear()}`,
        startDate: new Date(cur),
        endDate: new Date(monthEnd),
        prevStartDate: new Date(prev),
        prevEndDate: new Date(pMonthEnd),
        netSales: 0,
        grossSales: 0,
        orderCount: 0,
        comparisonSales: 0,
        comparisonOrderCount: 0,
        comparisonLabel: `${monthNames[prev.getMonth()]} ${prev.getFullYear()}`
      });

      cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
      prev = new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
    }
    return buckets;
  }

  // Default: daily
  let cur = new Date(currentStart);
  let prev = new Date(prevStart);

  while (cur <= currentEnd) {
    const curYear = cur.getFullYear();
    const curMonth = cur.getMonth();
    const curDate = cur.getDate();
    const curDay = cur.getDay();

    const prevYear = prev.getFullYear();
    const prevMonth = prev.getMonth();
    const prevDate = prev.getDate();

    const key = `${curYear}-${String(curMonth + 1).padStart(2, '0')}-${String(curDate).padStart(2, '0')}`;
    const prevKey = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(prevDate).padStart(2, '0')}`;

    buckets.push({
      key,
      date: key,
      label: `${curDate} ${monthNames[curMonth]}`,
      fullDate: `${dayNames[curDay]}, ${curDate} ${monthNames[curMonth]} ${curYear}`,
      curYear,
      curMonth,
      curDate,
      prevKey,
      prevLabel: `${prevDate} ${monthNames[prevMonth]}`,
      netSales: 0,
      grossSales: 0,
      orderCount: 0,
      comparisonSales: 0,
      comparisonOrderCount: 0,
      comparisonLabel: `${prevDate} ${monthNames[prevMonth]}`
    });

    cur.setDate(cur.getDate() + 1);
    prev.setDate(prev.getDate() + 1);
  }

  return buckets;
}

/**
 * Assigns orders to corresponding interval buckets
 */
function populateBuckets(buckets, currentOrders, prevOrders, granularity) {
  // 1. Process current period orders
  for (const order of currentOrders) {
    const isCancelledOrRefunded =
      [ORDER_STATUS.CANCELLED, ORDER_STATUS.REFUNDED, ORDER_STATUS.RETURNED].includes(order.status) ||
      order.paymentStatus === PAYMENT_STATUS.REFUNDED;
    if (isCancelledOrRefunded) continue;

    const d = new Date(order.createdAt);
    const subtotal = parseFloat(order.subtotal || 0);
    const total = parseFloat(order.totalAmount || 0);

    let bucket = null;
    if (granularity === 'hourly') {
      const h = d.getHours();
      bucket = buckets.find((b) => b.hour === h);
    } else if (granularity === 'weekly' || granularity === 'monthly') {
      bucket = buckets.find((b) => d >= b.startDate && d <= b.endDate);
    } else {
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      bucket = buckets.find((b) => b.date === dateKey);
    }

    if (bucket) {
      bucket.netSales = Number((bucket.netSales + total).toFixed(2));
      bucket.grossSales = Number((bucket.grossSales + subtotal).toFixed(2));
      bucket.orderCount += 1;
    }
  }

  // 2. Process comparison period orders
  for (const order of prevOrders) {
    const isCancelledOrRefunded =
      [ORDER_STATUS.CANCELLED, ORDER_STATUS.REFUNDED, ORDER_STATUS.RETURNED].includes(order.status) ||
      order.paymentStatus === PAYMENT_STATUS.REFUNDED;
    if (isCancelledOrRefunded) continue;

    const d = new Date(order.createdAt);
    const total = parseFloat(order.totalAmount || 0);

    let bucket = null;
    if (granularity === 'hourly') {
      const h = d.getHours();
      bucket = buckets.find((b) => b.hour === h);
    } else if (granularity === 'weekly' || granularity === 'monthly') {
      bucket = buckets.find((b) => d >= b.prevStartDate && d <= b.prevEndDate);
    } else {
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      bucket = buckets.find((b) => b.prevKey === dateKey);
    }

    if (bucket) {
      bucket.comparisonSales = Number((bucket.comparisonSales + total).toFixed(2));
      bucket.comparisonOrderCount += 1;
    }
  }

  // Clean internal date properties before returning
  return buckets.map((b) => {
    const { startDate, endDate, prevStartDate, prevEndDate, curYear, curMonth, curDate, prevKey, hour, ...cleaned } = b;
    return cleaned;
  });
}

function calculateGrowth(current, previous) {
  if (previous > 0) {
    return Number((((current - previous) / previous) * 100).toFixed(1));
  }
  return current > 0 ? 100 : 0;
}

export class AnalyticsService {
  /**
   * Retrieves comprehensive sales and trend analytics for a merchant's business
   * Supports:
   * - Scoping to specific businessId
   * - Date range filters (today, yesterday, 7d, 30d, this_month, last_month, custom)
   * - Granularity options (hourly, daily, weekly, monthly)
   * - Comparison with equivalent previous period
   * - Real financial calculations in INR
   */
  static async getBusinessAnalytics(businessId, userId, userRole, query = {}) {
    const business = await Business.findByPk(businessId);
    if (!business) {
      throw ApiError.notFound('Business not found');
    }

    if (userRole !== ROLES.ADMIN && business.ownerId !== userId) {
      throw ApiError.forbidden('You do not have permission to view analytics for this business');
    }

    const { range = '7d', startDate, endDate, granularity: userGranularity } = query;

    // 1. Resolve date windows for current and comparison periods
    const { currentStart, currentEnd, prevStart, prevEnd, defaultGranularity } = resolveDatePeriods(
      range,
      startDate,
      endDate
    );

    const activeGranularity = userGranularity || defaultGranularity;

    // 2. Fetch current period orders with payment details
    const currentOrders = await Order.findAll({
      where: {
        businessId,
        createdAt: {
          [Op.between]: [currentStart, currentEnd]
        }
      },
      include: [
        {
          model: Payment,
          as: 'payment'
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    // 3. Fetch comparison period orders with payment details
    const prevOrders = await Order.findAll({
      where: {
        businessId,
        createdAt: {
          [Op.between]: [prevStart, prevEnd]
        }
      },
      include: [
        {
          model: Payment,
          as: 'payment'
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    // 4. Calculate metrics for current and previous periods
    const currentMetrics = calculatePeriodMetrics(currentOrders);
    const prevMetrics = calculatePeriodMetrics(prevOrders);

    // 5. Build zero-filled interval buckets and populate sales data
    const rawBuckets = buildIntervalBuckets(
      activeGranularity,
      currentStart,
      currentEnd,
      prevStart,
      prevEnd
    );
    const trendSeries = populateBuckets(rawBuckets, currentOrders, prevOrders, activeGranularity);

    // 6. Best-selling Products in current period
    const bestSelling = await OrderItem.findAll({
      attributes: [
        'productId',
        'productName',
        [sequelize.fn('SUM', sequelize.col('OrderItem.quantity')), 'totalQuantitySold'],
        [sequelize.fn('SUM', sequelize.col('OrderItem.subtotal')), 'totalProductRevenue']
      ],
      include: [
        {
          model: Order,
          as: 'order',
          attributes: [],
          where: {
            businessId,
            createdAt: {
              [Op.between]: [currentStart, currentEnd]
            },
            status: {
              [Op.notIn]: [ORDER_STATUS.CANCELLED, ORDER_STATUS.REFUNDED, ORDER_STATUS.RETURNED]
            }
          }
        }
      ],
      group: ['OrderItem.productId', 'OrderItem.productName'],
      order: [[sequelize.fn('SUM', sequelize.col('OrderItem.quantity')), 'DESC']],
      limit: 5,
      raw: true
    });

    // 7. Backward-compatible monthly trends (Last 6 months) for any existing callers
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrends = await Order.findAll({
      where: {
        businessId,
        status: {
          [Op.notIn]: [ORDER_STATUS.CANCELLED, ORDER_STATUS.REFUNDED, ORDER_STATUS.RETURNED]
        },
        createdAt: {
          [Op.gte]: sixMonthsAgo
        }
      },
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m'), 'month'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'orderCount'],
        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('totalAmount')), 0), 'revenue']
      ],
      group: [sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m')],
      order: [[sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m'), 'ASC']],
      raw: true
    });

    return {
      currency: 'INR',
      currencySymbol: '₹',
      range,
      granularity: activeGranularity,
      period: {
        current: {
          start: currentStart.toISOString(),
          end: currentEnd.toISOString()
        },
        comparison: {
          start: prevStart.toISOString(),
          end: prevEnd.toISOString()
        }
      },
      summary: {
        totalRevenue: currentMetrics.netSales, // Backward compatibility
        netSales: currentMetrics.netSales,
        grossSales: currentMetrics.grossSales,
        discountAmount: currentMetrics.discountAmount,
        refundAmount: currentMetrics.refundAmount,
        verifiedCollections: currentMetrics.verifiedCollections,
        codPendingCollection: currentMetrics.codPendingCollection,
        totalOrders: currentMetrics.totalOrders,
        allOrdersCount: currentMetrics.allOrdersCount,
        averageOrderValue: currentMetrics.averageOrderValue,
        currency: 'INR',
        comparison: {
          netSales: prevMetrics.netSales,
          grossSales: prevMetrics.grossSales,
          discountAmount: prevMetrics.discountAmount,
          refundAmount: prevMetrics.refundAmount,
          verifiedCollections: prevMetrics.verifiedCollections,
          codPendingCollection: prevMetrics.codPendingCollection,
          totalOrders: prevMetrics.totalOrders,
          averageOrderValue: prevMetrics.averageOrderValue,
          salesGrowth: calculateGrowth(currentMetrics.netSales, prevMetrics.netSales),
          grossSalesGrowth: calculateGrowth(currentMetrics.grossSales, prevMetrics.grossSales),
          ordersGrowth: calculateGrowth(currentMetrics.totalOrders, prevMetrics.totalOrders),
          verifiedCollectionsGrowth: calculateGrowth(
            currentMetrics.verifiedCollections,
            prevMetrics.verifiedCollections
          )
        }
      },
      trend: trendSeries,
      orderStatusBreakdown: currentMetrics.statusCounts,
      bestSellingProducts: bestSelling.map((p) => ({
        productId: p.productId,
        productName: p.productName,
        totalQuantitySold: parseInt(p.totalQuantitySold, 10) || 0,
        totalProductRevenue: parseFloat(Number(p.totalProductRevenue || 0).toFixed(2))
      })),
      monthlyTrends: monthlyTrends.map((t) => ({
        month: t.month,
        orderCount: parseInt(t.orderCount, 10),
        revenue: parseFloat(Number(t.revenue).toFixed(2))
      }))
    };
  }
}

export default AnalyticsService;
