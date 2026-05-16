import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user || !user.agencyId) return res.status(401).json({ error: 'Unauthorized' });

    const agencyId = user.agencyId;

    const [campaignCount, activeCampaigns, influencers, clients] = await Promise.all([
      prisma.campaign.count({ where: { agencyId } }),
      prisma.campaign.count({ where: { agencyId, status: 'ACTIVE' } }),
      prisma.influencer.count({ where: { agencyId } }),
      prisma.client.findMany({ where: { agencyId }, select: { monthlyBudget: true } })
    ]);

    const totalMRR = clients.reduce((acc, c) => acc + (c.monthlyBudget || 0), 0);

    // For charts, since we don't track historical revenue/spend in DB yet, 
    // we return empty arrays so it's a "clean" application without fake data.
    res.json({
      totalRevenue: totalMRR,
      activeCampaigns,
      totalInfluencers: influencers,
      chartData: [],
      recentActivity: []
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getReportStats = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user || !user.agencyId) return res.status(401).json({ error: 'Unauthorized' });

    const agencyId = user.agencyId;

    const campaigns = await prisma.campaign.findMany({ where: { agencyId }, select: { budget: true } });
    const totalBudget = campaigns.reduce((acc, c) => acc + (c.budget || 0), 0);

    // Again, no historical mock data. Just clean empty charts.
    res.json({
      totalRevenue: 0,
      totalAdSpend: totalBudget,
      avgRoi: 0,
      totalReach: 0,
      revenueData: [],
      channelData: [],
      campaignPerf: []
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
