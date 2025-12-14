import { Request, Response } from 'express';
import { successResponse, errorResponse } from '../utils/apiReponose.util';
import addressService from '../services/address.service';

const addressController = {
  // Add a new address for the user
  create: async (req: Request, res: Response) => {
    try {
      const userId = Number(req.headers['x-user-id']);
      const address = await addressService.create({ ...req.body, userId });
      res.status(201).json(successResponse('Address created', address));
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  },
  // Get all addresses for the user
  listByUser: async (req: Request, res: Response) => {
    try {
      const userId = Number(req.headers['x-user-id']);
      const addresses = await addressService.listByUser(userId);
      res.status(200).json(successResponse('Addresses fetched', addresses));
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  },
  // Update an existing address
  update: async (req: Request, res: Response) => {
    try {
      const addressId = Number(req.params.addressId);
      const updated = await addressService.update(addressId, req.body);
      res.status(200).json(successResponse('Address updated', updated));
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  },
  // Delete an address
  delete: async (req: Request, res: Response) => {
    try {
      const addressId = Number(req.params.addressId);
      const result = await addressService.delete(addressId);
      res.status(200).json(successResponse('Address deleted', result));
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  },
  // Set an address as the default address for the user
  setDefault: async (req: Request, res: Response) => {
    try {
      const userId = Number(req.headers['x-user-id']);
      const addressId = Number(req.params.addressId);
      const updated = await addressService.setDefault(userId, addressId);
      res.status(200).json(successResponse('Default address set', updated));
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  },
  getByIdWithUserEmail: async (req: Request, res: Response) => {
    try {
      const addressId = Number(req.params.addressId);
      const address = await addressService.getByIdWithUserEmail(addressId);
      res
        .status(200)
        .json(
          successResponse(
            'Address with user email fetched successfully',
            address
          )
        );
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  },
  getListAddressByEmail: async (req: Request, res: Response) => {
    try {
      const email = req.params.email;
      const addresses = await addressService.getListAddressByEmail(email);
      res.status(200).json(successResponse('Addresses fetched', addresses));
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  },
};

export default addressController;
