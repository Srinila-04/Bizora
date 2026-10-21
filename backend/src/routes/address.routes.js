import { Router } from 'express';
import AddressController from '../controllers/address.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import {
  createAddressValidator,
  updateAddressValidator,
  addressIdParamValidator
} from '../validators/address.validator.js';

const router = Router();

// All address routes require authentication
router.use(authenticate);

router.get('/', AddressController.getAddresses);
router.post('/', validateRequest(createAddressValidator), AddressController.createAddress);
router.get('/:id', validateRequest(addressIdParamValidator), AddressController.getAddressById);
router.put('/:id', validateRequest(updateAddressValidator), AddressController.updateAddress);
router.delete('/:id', validateRequest(addressIdParamValidator), AddressController.deleteAddress);
router.patch('/:id/default', validateRequest(addressIdParamValidator), AddressController.setDefaultAddress);

export default router;

