// controllers/ExchangeStoriesController.ts

import { Request, Response } from 'express';
import ExchangeStories from '../../models/ExchangeStoryModel';
import type {StoryFilters, CreateStoryRequest, ExchangeStory, CountriesResponse} from 'va-hybrid-types/contentTypes';

type PaginationOptions = {
  offset?: number;
  limit?: number;
};

// Get approved stories with filters
export async function getApprovedStories(
  filters: StoryFilters = {},
  options: PaginationOptions = {}
): Promise<ExchangeStory[]> {
  const query: Record<string, unknown> = { isApproved: true };

  if (filters.country) query.country = filters.country;
  if (filters.city) query.city = filters.city;
  if (filters.search) query.$text = { $search: filters.search };
  if (filters.minRating) query['ratings.overall'] = { $gte: Number(filters.minRating) };
  if (filters.isFeatured !== undefined) query.isFeatured = filters.isFeatured;
  if (filters.tags) query.tags = { $in: filters.tags };

  let sort: Record<string, 1 | -1> = { createdAt: -1 };

  if (filters.sort === 'popular') sort = { likes: -1 };
  else if (filters.sort === 'rating') sort = { 'ratings.overall': -1 };

  return ExchangeStories.find(query)
    .sort(sort)
    .skip(options.offset ?? 0)
    .limit(options.limit ?? 12)
    .lean<ExchangeStory[]>();
}

// Get story by ID
export async function getStoryById(_id: string): Promise<ExchangeStory | null> {
  return ExchangeStories.findById(_id).lean<ExchangeStory | null>();
}

// Create new story (Admin only)
export async function createStory(
  data: CreateStoryRequest,
  adminId: string
): Promise<ExchangeStory> {
  const story = await ExchangeStories.create({
    ...data,
    isApproved: false,
    createdBy: adminId
  });

  const { _id, ...rest } = story.toObject();
  return { id: _id.toString(), ...rest } as unknown as ExchangeStory;
}

// Update story
export async function updateStory(
  _id: string,
  data: Partial<CreateStoryRequest>
): Promise<ExchangeStory | null> {
  return ExchangeStories.findByIdAndUpdate(_id, data, { new: true }).lean<ExchangeStory | null>();
}

// Delete story (Admin only)
export async function deleteStory(id: string): Promise<ExchangeStory | null> {
  return ExchangeStories.findByIdAndDelete(id).lean<ExchangeStory | null>();
}

// Approve story (Admin only)
export async function approveStory(id: string): Promise<ExchangeStory | null> {
  return ExchangeStories.findByIdAndUpdate(
    id,
    { isApproved: true },
    { new: true }
  ).lean<ExchangeStory | null>();
}

// Increment like count
export async function likeStory(id: string): Promise<number> {
  const updated = await ExchangeStories.findByIdAndUpdate(
    id,
    { $inc: { likes: 1 } },
    { new: true }
  ).lean<ExchangeStory | null>();

  return updated?.likes ?? 0;
}

// Get list of all countries with aggregated counts
export async function getCountriesWithCounts(): Promise<CountriesResponse['countries']> {
  const pipeline = [
    { $match: { isApproved: true } },
    {
      $group: {
        _id: { country: '$country', city: '$city' },
        count: { $sum: 1 }
      }
    }
  ];

  const results = await ExchangeStories.aggregate(pipeline);

  const map: Record<string, { count: number; cities: Record<string, number> }> = {};

  results.forEach(r => {
    const { country, city } = r._id;
    if (!map[country]) map[country] = { count: 0, cities: {} };

    map[country].count += r.count;
    map[country].cities[city] = (map[country].cities[city] || 0) + r.count;
  });

  return Object.entries(map).map(([country, data]) => ({
    country,
    count: data.count,
    cities: Object.entries(data.cities).map(([city, count]) => ({ city, count }))
  }));
}

// GET /stories
export const getApprovedStoriesHandler = async (req: Request, res: Response) => {
  try {
    const stories = await getApprovedStories(req.query);
    res.json(stories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// GET /stories/all
export const getAllStoriesHandler = async (req: Request, res: Response) => {
  try {
    const stories = await getApprovedStories(req.query);
    res.json(stories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// GET /stories/:id
export const getStoryByIdHandler = async (req: Request, res: Response) => {
  try {
    const story = await getStoryById(req.params.id);
    if (!story) return res.status(404).json({ error: 'Story not found' });
    res.json(story);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// POST /stories
export const createStoryHandler = async (req: Request, res: Response) => {
  try {
    const newStory = await createStory(req.body, req.user?.id ?? 'adminId');
    res.status(201).json(newStory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// PUT /stories/:id
export const updateStoryHandler = async (req: Request, res: Response) => {
  try {
    const updated = await updateStory(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// DELETE /stories/:id
export const deleteStoryHandler = async (req: Request, res: Response) => {
  try {
    const deleted = await deleteStory(req.params.id);
    res.json(deleted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// PUT /stories/:id/approve
export const approveStoryHandler = async (req: Request, res: Response) => {
  try {
    const approved = await approveStory(req.params.id);
    res.json(approved);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// POST /stories/:id/like
export const likeStoryHandler = async (req: Request, res: Response) => {
  try {
    const likes = await likeStory(req.params.id);
    res.json({ likes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// GET /countries
export const getCountriesHandler = async (req: Request, res: Response) => {
  try {
    const countries = await getCountriesWithCounts();
    res.json(countries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: (error as Error).message });
  }
};


