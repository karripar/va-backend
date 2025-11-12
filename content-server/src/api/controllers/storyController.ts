import { Request, Response, NextFunction } from "express";
import ExchangeStory from "../../models/ExchangeStoryModel";

export const getPublicStories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { country, university, tags, minRating, search, sort = 'recent', limit = 12, offset = 0 } = req.query;

    const query: Record<string, unknown> = { status: 'published' };

    if (country) query.country = country;
    if (university) query.university = new RegExp(university as string, 'i');
    if (tags) query.tags = { $in: (tags as string).split(',') };
    if (minRating) query['ratings.overall'] = { $gte: Number(minRating) };
    if (search) query.$text = { $search: search as string };

    let sortOptions: { [key: string]: 1 | -1 } = { createdAt: -1 };
    if (sort === 'popular') sortOptions = { likes: -1 };
    else if (sort === 'rating') sortOptions = { 'ratings.overall': -1 };

    const total = await ExchangeStory.countDocuments(query);
    const stories = await ExchangeStory.find(query)
      .sort(sortOptions)
      .limit(Number(limit))
      .skip(Number(offset));

    res.json({
      stories,
      total,
      hasMore: total > Number(offset) + Number(limit)
    });
  } catch (error) {
    next(error);
  }
};

export const getPublicStoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const story = await ExchangeStory.findOne({
      _id: req.params.id,
      status: 'published'
    });

    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    res.json({ story });
  } catch (error) {
    next(error);
  }
};

export const getFeaturedStories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stories = await ExchangeStory.find({
      featured: true,
      status: 'published'
    })
    .sort({ createdAt: -1 })
    .limit(6);

    res.json({ stories });
  } catch (error) {
    next(error);
  }
};
