"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserStatus = exports.getAllUsers = exports.getCollectorPerformance = exports.getUserAnalytics = exports.getPickupAnalytics = exports.getRevenueAnalytics = exports.getDashboardStats = void 0;
const prisma_1 = require("../utils/prisma");
// Get dashboard overview stats
const getDashboardStats = async (req, res, next) => {
    try {
        // Get counts for different metrics
        const [totalUsers, totalCollectors, totalPickups, completedPickups, pendingPickups, totalRevenue, recentUsers] = await Promise.all([
            prisma_1.prisma.user.count({ where: { role: 'USER' } }),
            prisma_1.prisma.user.count({ where: { role: 'COLLECTOR' } }),
            prisma_1.prisma.pickupRequest.count(),
            prisma_1.prisma.pickupRequest.count({ where: { status: 'COMPLETED' } }),
            prisma_1.prisma.pickupRequest.count({ where: { status: { in: ['PENDING', 'ASSIGNED'] } } }),
            prisma_1.prisma.payment.aggregate({
                where: { status: 'COMPLETED' },
                _sum: { amount: true }
            }),
            prisma_1.prisma.user.findMany({
                where: { role: 'USER' },
                orderBy: { createdAt: 'desc' },
                take: 5,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    createdAt: true
                }
            })
        ]);
        // Calculate trends (compare with last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
        const [lastWeekPickups, twoWeeksAgoPickups] = await Promise.all([
            prisma_1.prisma.pickupRequest.count({
                where: { createdAt: { gte: sevenDaysAgo } }
            }),
            prisma_1.prisma.pickupRequest.count({
                where: {
                    createdAt: {
                        gte: fourteenDaysAgo,
                        lt: sevenDaysAgo
                    }
                }
            })
        ]);
        // Calculate pickup growth rate
        const pickupGrowth = twoWeeksAgoPickups > 0
            ? ((lastWeekPickups - twoWeeksAgoPickups) / twoWeeksAgoPickups) * 100
            : 0;
        // Get waste type distribution
        const wasteTypeDistribution = await prisma_1.prisma.pickupRequest.groupBy({
            by: ['wasteType'],
            _count: { wasteType: true }
        });
        // Calculate completion rate
        const completionRate = totalPickups > 0
            ? (completedPickups / totalPickups) * 100
            : 0;
        res.json({
            stats: {
                totalUsers,
                totalCollectors,
                totalPickups,
                completedPickups,
                pendingPickups,
                totalRevenue: totalRevenue._sum.amount || 0,
                completionRate: Math.round(completionRate * 10) / 10,
                pickupGrowth: Math.round(pickupGrowth * 10) / 10
            },
            recentUsers,
            wasteTypeDistribution: wasteTypeDistribution.map(w => ({
                type: w.wasteType,
                count: w._count.wasteType
            }))
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getDashboardStats = getDashboardStats;
// Get revenue analytics
const getRevenueAnalytics = async (req, res, next) => {
    try {
        const { period = '30' } = req.query;
        const days = parseInt(period);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const payments = await prisma_1.prisma.payment.findMany({
            where: {
                status: 'COMPLETED',
                createdAt: { gte: startDate }
            },
            orderBy: { createdAt: 'asc' }
        });
        // Group by day
        const dailyRevenue = {};
        payments.forEach(payment => {
            const date = payment.createdAt.toISOString().split('T')[0];
            dailyRevenue[date] = (dailyRevenue[date] || 0) + payment.amount;
        });
        // Calculate total and average
        const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
        const avgTransaction = payments.length > 0 ? totalRevenue / payments.length : 0;
        res.json({
            totalRevenue,
            avgTransaction: Math.round(avgTransaction * 100) / 100,
            transactionCount: payments.length,
            dailyRevenue: Object.entries(dailyRevenue).map(([date, amount]) => ({
                date,
                amount
            }))
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getRevenueAnalytics = getRevenueAnalytics;
// Get pickup analytics
const getPickupAnalytics = async (req, res, next) => {
    try {
        const { period = '30' } = req.query;
        const days = parseInt(period);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const pickups = await prisma_1.prisma.pickupRequest.findMany({
            where: { createdAt: { gte: startDate } },
            orderBy: { createdAt: 'asc' }
        });
        // Group by day
        const dailyPickups = {};
        pickups.forEach(pickup => {
            const date = pickup.createdAt.toISOString().split('T')[0];
            if (!dailyPickups[date]) {
                dailyPickups[date] = { total: 0, completed: 0 };
            }
            dailyPickups[date].total++;
            if (pickup.status === 'COMPLETED') {
                dailyPickups[date].completed++;
            }
        });
        // Status distribution
        const statusDistribution = await prisma_1.prisma.pickupRequest.groupBy({
            by: ['status'],
            _count: { status: true }
        });
        // Waste type distribution
        const wasteTypeDistribution = await prisma_1.prisma.pickupRequest.groupBy({
            by: ['wasteType'],
            _count: { wasteType: true }
        });
        res.json({
            totalPickups: pickups.length,
            completedPickups: pickups.filter(p => p.status === 'COMPLETED').length,
            dailyPickups: Object.entries(dailyPickups).map(([date, data]) => ({
                date,
                ...data
            })),
            statusDistribution: statusDistribution.map(s => ({
                status: s.status,
                count: s._count.status
            })),
            wasteTypeDistribution: wasteTypeDistribution.map(w => ({
                type: w.wasteType,
                count: w._count.wasteType
            }))
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getPickupAnalytics = getPickupAnalytics;
// Get user analytics
const getUserAnalytics = async (req, res, next) => {
    try {
        const users = await prisma_1.prisma.user.findMany({
            where: { role: 'USER' },
            select: {
                id: true,
                createdAt: true,
                userPickups: {
                    select: { id: true, status: true, createdAt: true }
                }
            }
        });
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const activeUsers = users.filter(user => {
            const hasRecentActivity = user.userPickups.some((pickup) => new Date(pickup.createdAt) >= thirtyDaysAgo);
            return hasRecentActivity;
        });
        const newUsersThisMonth = users.filter(user => {
            const createdThisMonth = new Date(user.createdAt) >= thirtyDaysAgo;
            return createdThisMonth;
        });
        const totalUserPickups = users.reduce((sum, user) => sum + user.userPickups.length, 0);
        const avgPickupsPerUser = users.length > 0
            ? totalUserPickups / users.length
            : 0;
        res.json({
            totalUsers: users.length,
            activeUsers: activeUsers.length,
            newUsersThisMonth: newUsersThisMonth.length,
            avgPickupsPerUser: Math.round(avgPickupsPerUser * 10) / 10,
            userGrowthRate: users.length > 0
                ? Math.round((newUsersThisMonth.length / users.length) * 100 * 10) / 10
                : 0
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUserAnalytics = getUserAnalytics;
// Get collector performance
const getCollectorPerformance = async (req, res, next) => {
    try {
        const collectors = await prisma_1.prisma.user.findMany({
            where: { role: 'COLLECTOR' },
            select: {
                id: true,
                name: true,
                email: true,
                collectorPickups: {
                    where: { status: 'COMPLETED' },
                    select: { id: true, actualPrice: true, createdAt: true }
                }
            }
        });
        const collectorStats = collectors.map((collector) => {
            const completedPickups = collector.collectorPickups.length;
            const totalEarnings = collector.collectorPickups.reduce((sum, p) => sum + (p.actualPrice || 0), 0);
            return {
                id: collector.id,
                name: collector.name,
                email: collector.email,
                completedPickups,
                totalEarnings,
                avgRating: 4.5
            };
        });
        collectorStats.sort((a, b) => b.completedPickups - a.completedPickups);
        res.json({
            totalCollectors: collectors.length,
            topCollectors: collectorStats.slice(0, 10),
            avgPickupsPerCollector: collectors.length > 0
                ? Math.round((collectorStats.reduce((sum, c) => sum + c.completedPickups, 0) / collectors.length) * 10) / 10
                : 0
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCollectorPerformance = getCollectorPerformance;
// Get all users (admin)
const getAllUsers = async (req, res, next) => {
    try {
        const { role, page = 1, limit = 20, search } = req.query;
        const where = {};
        if (role)
            where.role = role;
        if (search) {
            where.OR = [
                { name: { contains: search } },
                { email: { contains: search } }
            ];
        }
        const skip = (Number(page) - 1) * Number(limit);
        const [users, total] = await Promise.all([
            prisma_1.prisma.user.findMany({
                where,
                select: {
                    id: true,
                    email: true,
                    name: true,
                    phone: true,
                    role: true,
                    isActive: true,
                    createdAt: true,
                    _count: {
                        select: { userPickups: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: Number(limit)
            }),
            prisma_1.prisma.user.count({ where })
        ]);
        res.json({
            users: users.map((u) => ({ ...u, pickupCount: u._count.userPickups })),
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllUsers = getAllUsers;
// Update user status (admin)
const updateUserStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;
        const user = await prisma_1.prisma.user.update({
            where: { id },
            data: { isActive },
            select: {
                id: true,
                email: true,
                name: true,
                isActive: true
            }
        });
        res.json({
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
            user
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateUserStatus = updateUserStatus;
//# sourceMappingURL=analytics.controller.js.map