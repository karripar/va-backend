import { Request, Response, NextFunction } from "express";
import ExchangeStory from "../../models/ExchangeStoryModel";
import StoryReaction from "../../models/StoryReactionModel";
import { getUserFromRequest } from "../../utils/authHelpers";

export const getStories = async (req: Request, res: Response, next: NextFunction) => {
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

export const getStoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserFromRequest(req);
    const story = await ExchangeStory.findById(req.params.id);

    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    const reactions = await StoryReaction.find({
      userId,
      storyId: story._id
    });

    const userReaction = {
      liked: reactions.some(r => r.type === 'like'),
      saved: reactions.some(r => r.type === 'save')
    };

    res.json({ story, userReaction });
  } catch (error) {
    next(error);
  }
};

export const createStory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserFromRequest(req);

    const story = await ExchangeStory.create({
      ...req.body,
      userId,
      userName: req.body.userName || `User ${userId}`,
      userAvatar: req.body.userAvatar || ''
    });

    res.status(201).json(story);
  } catch (error) {
    next(error);
  }
};

export const updateStory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserFromRequest(req);

    const story = await ExchangeStory.findOneAndUpdate(
      { _id: req.params.id, userId },
      req.body,
      { new: true }
    );

    if (!story) {
      return res.status(404).json({ error: 'Story not found or unauthorized' });
    }

    res.json(story);
  } catch (error) {
    next(error);
  }
};

export const reactToStory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserFromRequest(req);
    const { type, action } = req.body;
    const storyId = req.params.id;

    if (!['like', 'save'].includes(type) || !['add', 'remove'].includes(action)) {
      return res.status(400).json({ error: 'Invalid type or action' });
    }

    if (action === 'add') {
      await StoryReaction.findOneAndUpdate(
        { userId, storyId, type },
        { userId, storyId, type },
        { upsert: true }
      );
      await ExchangeStory.findByIdAndUpdate(storyId, {
        $inc: { [type === 'like' ? 'likes' : 'saves']: 1 }
      });
    } else {
      await StoryReaction.deleteOne({ userId, storyId, type });
      await ExchangeStory.findByIdAndUpdate(storyId, {
        $inc: { [type === 'like' ? 'likes' : 'saves']: -1 }
      });
    }

    const story = await ExchangeStory.findById(storyId);
    const reactions = await StoryReaction.find({ userId, storyId });

    res.json({
      likes: story?.likes || 0,
      saves: story?.saves || 0,
      userReaction: {
        liked: reactions.some(r => r.type === 'like'),
        saved: reactions.some(r => r.type === 'save')
      }
    });
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
