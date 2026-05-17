import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const InfluencerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().optional(),
  instagram: z.string().optional(),
  tiktok: z.string().optional(),
  youtube: z.string().optional(),
  niche: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  notes: z.string().optional(),
});

const InfluencerUpdateSchema = InfluencerSchema.partial();

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

    const validation = InfluencerSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.errors[0].message });
    }

    const { name, email, phone, instagram, tiktok, youtube, niche, rating, notes } = validation.data;

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

    const validation = InfluencerUpdateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.errors[0].message });
    }

    const { id } = req.params;
    const { name, email, phone, instagram, tiktok, youtube, niche, rating, notes } = validation.data;

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
