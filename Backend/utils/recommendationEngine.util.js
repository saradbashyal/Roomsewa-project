import { Booking } from "../models/Booking.model.js";
import { Room } from "../models/Room.model.js";

export class RecommendationEngine {
    static calculateRoomSimilarity(userPreferences, roomFeatures) {
        let similarityScore = 0;
        let totalFeatures = 0;

        // Room Type (40%)
        if (userPreferences.roomTypes && roomFeatures.roomType) {
            const roomTypeSimilarity = userPreferences.roomTypes.includes(roomFeatures.roomType) ? 1 : 0;
            similarityScore += roomTypeSimilarity * 0.4;
            totalFeatures += 0.4;
        }

        // Location (30%)
        if (userPreferences.cities && roomFeatures.city) {
            const citySimilarity = userPreferences.cities.includes(roomFeatures.city) ? 1 : 0;
            similarityScore += citySimilarity * 0.3;
            totalFeatures += 0.3;
        }

        // Amenities (20%)
        if (userPreferences.amenities && roomFeatures.amenities) {
            const amenityMatches = userPreferences.amenities.filter(
                amenity => roomFeatures.amenities.includes(amenity)
            ).length;
            const amenitySimilarity = amenityMatches / Math.max(userPreferences.amenities.length, roomFeatures.amenities.length);
            similarityScore += amenitySimilarity * 0.2;
            totalFeatures += 0.2;
        }

        // Price Range (10%)
        if (userPreferences.priceRanges && roomFeatures.price) {
            const priceSimilarity = userPreferences.priceRanges.some(range => 
                roomFeatures.price >= range.min && roomFeatures.price <= range.max
            ) ? 1 : 0;
            similarityScore += priceSimilarity * 0.1;
            totalFeatures += 0.1;
        }

        return totalFeatures > 0 ? similarityScore / totalFeatures : 0;
    }

    static extractUserPreferences(userBookings) {
        const preferences = {
            roomTypes: {},
            cities: {},
            amenities: {},
            priceRanges: {}
        };

        userBookings.forEach(booking => {
            const room = booking.room;

            if (room.roomType) {
                preferences.roomTypes[room.roomType] = (preferences.roomTypes[room.roomType] || 0) + 1;
            }

            if (room.location.city) {
                preferences.cities[room.location.city] = (preferences.cities[room.location.city] || 0) + 1;
            }

            if (room.amenities) {
                room.amenities.forEach(amenity => {
                    preferences.amenities[amenity] = (preferences.amenities[amenity] || 0) + 1;
                });
            }

            if (room.price) {
                const priceRange = Math.floor(room.price / 100) * 100; // Group by hundreds
                preferences.priceRanges[`${priceRange}-${priceRange + 100}`] = 
                    (preferences.priceRanges[`${priceRange}-${priceRange + 100}`] || 0) + 1;
            }
        });

        return {
            roomTypes: Object.keys(preferences.roomTypes).sort((a, b) => preferences.roomTypes[b] - preferences.roomTypes[a]),
            cities: Object.keys(preferences.cities).sort((a, b) => preferences.cities[b] - preferences.cities[a]),
            amenities: Object.keys(preferences.amenities).sort((a, b) => preferences.amenities[b] - preferences.amenities[a]),
            priceRanges: Object.keys(preferences.priceRanges).map(range => {
                const [min, max] = range.split('-').map(Number);
                return { min, max };
            }).sort((a, b) => a.min - b.min)
        };
    }

    static async generateRecommendations(userId, limit = 6) {
        try {
            const userBookings = await Booking.find({ user: userId })
                .populate({
                    path: 'room',
                    select: 'title titleNepali roomType location amenities price posterImage'
                }).limit(20).sort({ createdAt: -1 });

            if (userBookings.length === 0) {
                const popularRooms = await Room.find({
                    availableFrom: { $lte: new Date() }
                }).sort({ featured: -1, createdAt: -1 }).limit(limit);

                return popularRooms.map(room => ({
                    ...room.toObject(),
                    recommendationScore: 0.5,
                    reason: 'Popular room'
                }));
            }

            const userPreferences = this.extractUserPreferences(userBookings);
            const bookedRoomIds = userBookings.map(booking => booking.room._id);

            const availableRooms = await Room.find({
                _id: { $nin: bookedRoomIds },
                availableFrom: { $lte: new Date() }
            });

            const recommendedRooms = availableRooms.map(room => {
                const similarityScore = this.calculateRoomSimilarity(userPreferences, {
                    roomType: room.roomType,
                    city: room.location.city,
                    amenities: room.amenities,
                    price: room.price
                });

                let reason = 'Based on your preferences';
                if (userPreferences.roomTypes.length > 0 && room.roomType === userPreferences.roomTypes[0]) {
                    reason = `You like ${userPreferences.roomTypes[0]} rooms`;
                } else if (userPreferences.cities.length > 0 && room.location.city === userPreferences.cities[0]) {
                    reason = `You prefer rooms in ${userPreferences.cities[0]}`;
                }

                return {
                    ...room.toObject(),
                    recommendationScore: similarityScore,
                    reason
                };
            });

            return recommendedRooms
                .sort((a, b) => b.recommendationScore - a.recommendationScore)
                .slice(0, limit);
        } catch (error) {
            console.error(`Error generating recommendations:`, error);
            const fallbackRooms = await Room.find({
                availableFrom: { $lte: new Date() }
            }).sort({ featured: -1 }).limit(limit);

            return fallbackRooms.map(room => ({
                ...room.toObject(),
                recommendationScore: 0.3,
                reason: 'Popular room'
            }));
        }
    }
}