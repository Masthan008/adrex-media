import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getInfluencers = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user || !user.agencyId) return res.status(401).json({ error: 'Unauthorized' });

    const influencers = await prisma.influencer.findMany({
      where: { agencyId: user.agencyId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(influencers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const createInfluencer = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user || !user.agencyId) return res.status(401).json({ error: 'Unauthorized' });

    const { name, email, phone, instagram, tiktok, youtube, niche, rating, notes } = req.body;

    const influencer = await prisma.influencer.create({
      data: {
        agencyId: user.agencyId,
        name,
        email,
        phone,
        instagram,
        tiktok,
        youtube,
        niche,
        rating: rating || 0,
        notes
      }
    });

    res.status(201).json(influencer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateInfluencer = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user || !user.agencyId) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.params;
    const { name, email, phone, instagram, tiktok, youtube, niche, rating, notes } = req.body;

    const influencer = await prisma.influencer.update({
      where: { id, agencyId: user.agencyId },
      data: { name, email, phone, instagram, tiktok, youtube, niche, rating, notes }
    });

    res.json(influencer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deleteInfluencer = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user || !user.agencyId) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.params;

    await prisma.influencer.delete({
      where: { id, agencyId: user.agencyId }
    });

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
