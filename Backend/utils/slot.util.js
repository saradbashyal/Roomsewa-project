import { Service } from "../models/Service.model.js";
     import { ApiError } from "./ApiError.js";

     const LOCK_TIMEOUT_MINUTES = 7;

     export const lockSlotsForService = async (serviceId, slots, userId, session) => {
         console.log("Attempting to lock slots:", { serviceId, slots, userId });
         const lockUntil = new Date(Date.now() + LOCK_TIMEOUT_MINUTES * 60 * 1000);

         const service = await Service.findById(serviceId).session(session);
         if (!service) {
             throw new ApiError(404, "Service not found.");
         }
         console.log("Current slot availability:", service.availableSlots.filter(s => slots.includes(s._id.toString())));

         const result = await Service.updateOne(
             {
                 _id: serviceId,
                 "availableSlots": {
                     $not: {
                         $elemMatch: {
                             _id: { $in: slots },
                             status: { $in: ['locked', 'booked'] }
                         }
                     }
                 }
             },
             {
                 $set: {
                     "availableSlots.$[elem].status": "locked",
                     "availableSlots.$[elem].user": userId,
                     "availableSlots.$[elem].lockedUntil": lockUntil,
                     "hasLockedSlots": true
                 }
             },
             {
                 arrayFilters: [{ "elem._id": { $in: slots } }],
                 session
             }
         );

         console.log("Lock operation result:", result);
         if (result.modifiedCount === 0) {
             throw new ApiError(409, `One or more requested slots are no longer available. Please try again.`);
         }
         return lockUntil;
     };

     export const bookSlotsForService = async (serviceId, slots, userId, session) => {
         const result = await Service.updateOne(
             { _id: serviceId },
             {
                 $set: {
                     "availableSlots.$[elem].status": 'booked',
                     "availableSlots.$[elem].lockedUntil": null
                 }
             },
             {
                 arrayFilters: [
                     {
                         "elem._id": { $in: slots },
                         "elem.status": "locked",
                         "elem.user": userId
                     }
                 ],
                 session
             }
         );

         if (result.modifiedCount === 0) {
             throw new ApiError(403, `Booking failed. Your lock on slots may have expired or they were invalid.`);
         }
     };

     export const releaseSlotsForService = async (serviceId, slots, userId, session) => {
         await Service.updateOne(
             { _id: serviceId },
             {
                 $set: {
                     "availableSlots.$[elem].status": 'available',
                     "availableSlots.$[elem].user": null,
                     "availableSlots.$[elem].lockedUntil": null
                 }
             },
             {
                 arrayFilters: [
                     {
                         "elem._id": { $in: slots },
                         "elem.status": "locked",
                         "elem.user": userId
                     }
                 ],
                 session
             }
         );
     };

     export const cleanupAllExpiredLocks = async () => {
         const now = new Date();
         console.log("Running scheduled job: Cleaning up expired slot locks...");

         const result = await Service.updateMany(
             { "availableSlots.status": "locked", "availableSlots.lockedUntil": { $lt: now } },
             {
                 $set: {
                     "availableSlots.$[elem].status": "available",
                     "availableSlots.$[elem].user": null,
                     "availableSlots.$[elem].lockedUntil": null
                 }
             },
             {
                 arrayFilters: [
                     {
                         "elem.status": "locked",
                         "elem.lockedUntil": { $lt: now }
                     }
                 ]
             }
         );

         if (result.modifiedCount > 0) {
             console.log(`Cleaned up expired locks across ${result.modifiedCount} service(s).`);

             await Service.updateMany(
                 { hasLockedSlots: true, "availableSlots.status": { $ne: "locked" } },
                 { $set: { hasLockedSlots: false } }
             );
         }
     };