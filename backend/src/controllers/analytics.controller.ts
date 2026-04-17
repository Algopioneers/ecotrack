import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';

// Get dashboard overview stats
export const getDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get counts for different metrics
    const [
      totalUsers,
      totalCollectors,
      totalPickups,
      completedPickups,
      pendingPickups,
      totalRevenue,
      recentUsers
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.user.count({ where: { role: 'COLLECTOR' } }),
      prisma.pickupRequest.count(),
      prisma.pickupRequest.count({ where: { status: 'COMPLETED' } }),
      prisma.pickupRequest.count({ where: { status: { in: ['PENDING', 'ASSIGNED'] } } }),
      prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true }
      }),
      prisma.user.findMany({
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

    const [
      lastWeekPickups,
      twoWeeksAgoPickups
    ] = await Promise.all([
      prisma.pickupRequest.count({
        where: { createdAt: { gte: sevenDaysAgo } }
      }),
      prisma.pickupRequest.count({
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
    const wasteTypeDistribution = await prisma.pickupRequest.groupBy({
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
  } catch (error) {
    next(error);
  }
};

// Get revenue analytics
export const getRevenueAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const payments = await prisma.payment.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: startDate }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Group by day
    const dailyRevenue: Record<string, number> = {};
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
  } catch (error) {
    next(error);
  }
};

// Get pickup analytics
export const getPickupAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const pickups = await prisma.pickupRequest.findMany({
      where: { createdAt: { gte: startDate } },
      orderBy: { createdAt: 'asc' }
    });

    // Group by day
    const dailyPickups: Record<string, { total: number; completed: number }> = {};
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
    const statusDistribution = await prisma.pickupRequest.groupBy({
      by: ['status'],
      _count: { status: true }
    });

    // Waste type distribution
    const wasteTypeDistribution = await prisma.pickupRequest.groupBy({
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
  } catch (error) {
    next(error);
  }
};

// Get user analytics
export const getUserAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await prisma.user.findMany({
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
      const hasRecentActivity = user.userPickups.some(
        (pickup: any) => new Date(pickup.createdAt) >= thirtyDaysAgo
      );
      return hasRecentActivity;
    });

    const newUsersThisMonth = users.filter(user => {
      const createdThisMonth = new Date(user.createdAt) >= thirtyDaysAgo;
      return createdThisMonth;
    });

    const totalUserPickups = users.reduce(
      (sum: number, user: any) => sum + user.userPickups.length,
      0
    );
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
  } catch (error) {
    next(error);
  }
};

// Get collector performance
export const getCollectorPerformance = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const collectors = await prisma.user.findMany({
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

    const collectorStats = collectors.map((collector: any) => {
      const completedPickups = collector.collectorPickups.length;
      const totalEarnings = collector.collectorPickups.reduce(
        (sum: number, p: any) => sum + (p.actualPrice || 0),
        0
      );

      return {
        id: collector.id,
        name: collector.name,
        email: collector.email,
        completedPickups,
        totalEarnings,
        avgRating: 4.5
      };
    });

    collectorStats.sort((a: any, b: any) => b.completedPickups - a.completedPickups);

    res.json({
      totalCollectors: collectors.length,
      topCollectors: collectorStats.slice(0, 10),
      avgPickupsPerCollector: collectors.length > 0
        ? Math.round((collectorStats.reduce((sum: number, c: any) => sum + c.completedPickups, 0) / collectors.length) * 10) / 10
        : 0
    });
  } catch (error) {
    next(error);
  }
};

// Get all users (admin)
export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { role, page = 1, limit = 20, search } = req.query;

    const where: any = {};
    if (role) where.role = role as string;
    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { email: { contains: search as string } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
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
      prisma.user.count({ where })
    ]);

    res.json({
      users: users.map((u: any) => ({ ...u, pickupCount: u._count.userPickups })),
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update user status (admin)
export const updateUserStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await prisma.user.update({
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
  } catch (error) {
    next(error);
  }
};