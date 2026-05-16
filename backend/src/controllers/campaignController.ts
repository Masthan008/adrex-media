import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getCampaigns = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user || !user.agencyId) return res.status(401).json({ error: 'Unauthorized' });

    const campaigns = await prisma.campaign.findMany({
      where: { agencyId: user.agencyId },
      include: {
        client: {
          select: { companyName: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(campaigns);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const createCampaign = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user || !user.agencyId) return res.status(401).json({ error: 'Unauthorized' });

    const { name, clientId, description, budget, startDate, endDate, status } = req.body;

    const campaign = await prisma.campaign.create({
      data: {
        agencyId: user.agencyId,
        clientId,
        name,
        description,
        budget: budget ? parseFloat(budget) : 0,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: status || 'DRAFT'
      },
      include: {
        client: {
          select: { companyName: true }
        }
      }
    });

    res.status(201).json(campaign);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deleteCampaign = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user || !user.agencyId) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.params;

    await prisma.campaign.delete({
      where: { id, agencyId: user.agencyId }
    });

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
