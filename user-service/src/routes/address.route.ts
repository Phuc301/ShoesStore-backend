import { Router } from 'express';
import addressController from '../controllers/address.controller';

const router = Router();

router.post('/create', addressController.create);
router.get('/list', addressController.listByUser);
router.put('/update/:addressId', addressController.update);
router.delete('/delete/:addressId', addressController.delete);
router.patch('/set-default/:addressId', addressController.setDefault);
router.get('/details/:addressId', addressController.getByIdWithUserEmail);
router.get('/list-by-email/:email', addressController.getListAddressByEmail);

export default router;
