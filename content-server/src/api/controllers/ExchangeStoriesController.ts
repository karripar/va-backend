/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import ExchangeStories from '../models/ExchangeStoryModel';
import type { StoryFilters, CreateStoryRequest, ExchangeStory, CountriesResponse, PaginationOptions } from 'va-hybrid-types/contentTypes';


function buildQuery(filters: StoryFilters = {}, onlyApproved = true): Record<string, unknown> {
  const query: Record<string, unknown> = {};
  if (onlyApproved) query.isApproved = true;

  if (filters.country) query.country = filters.country;
  if (filters.city) query.city = filters.city;
  if (filters.search) query.$text = { $search: filters.search };
  if (filters.minRating) query['ratings.overall'] = { $gte: Number(filters.minRating) };
  if (filters.isFeatured !== undefined) query.isFeatured = filters.isFeatured;
  if (filters.tags) query.tags = { $in: filters.tags };

  return query;
}


async function fetchStoriesFromDb(
  filters: StoryFilters = {},
  options: PaginationOptions = {},
  onlyApproved = true
): Promise<ExchangeStory[]> {
  const query = buildQuery(filters, onlyApproved);

  let sort: Record<string, 1 | -1> = { createdAt: -1 };
  if (filters.sort === 'popular') sort = { likes: -1 };
  if (filters.sort === 'rating') sort = { 'ratings.overall': -1 };

  const offset = options.offset ? Number(options.offset) : 0;
  const limit = options.limit ? Number(options.limit) : 12;

  return ExchangeStories.find(query)
    .sort(sort)
    .skip(offset)
    .limit(limit)
    .lean<ExchangeStory[]>();
}

async function getStoryByIdDb(_id: string): Promise<ExchangeStory | null> {
  const story = await ExchangeStories.findById(_id).lean();
  if (!story) return null;
  const { _id: mongoId, ...rest } = story as any;
  return { id: mongoId.toString(), ...rest } as ExchangeStory;
}

async function createStoryDb(data: CreateStoryRequest, userId: string): Promise<ExchangeStory> {
  const storyDoc = await ExchangeStories.create({
    ...data,
    createdBy: userId,
    isApproved: false,
  });

  const { _id, ...rest } = storyDoc.toObject();
  return { id: _id.toString(), ...rest } as unknown as ExchangeStory;
}

async function updateStoryDb(_id: string, data: Partial<CreateStoryRequest>) {
  return ExchangeStories.findByIdAndUpdate(_id, data, { new: true }).lean();
}

async function deleteStoryDb(id: string) {
  return ExchangeStories.findByIdAndDelete(id).lean();
}

async function approveStoryDb(id: string) {
  return ExchangeStories.findByIdAndUpdate(id, { isApproved: true }, { new: true }).lean();
}

async function likeStoryDb(id: string): Promise<number> {
  const updated = await ExchangeStories.findByIdAndUpdate(
    id,
    { $inc: { likes: 1 } },
    { new: true }
  ).lean() as { likes?: number } | null;
  return updated?.likes ?? 0;
}

async function getCountriesWithCountsDb(): Promise<CountriesResponse['countries']> {
  const pipeline = [
    { $match: { isApproved: true } },
    { $group: { _id: { country: '$country', city: '$city' }, count: { $sum: 1 } } },
  ];

  const results = await ExchangeStories.aggregate(pipeline);
  const map: Record<string, { count: number; cities: Record<string, number> }> = {};

  results.forEach((r: any) => {
    const { country, city } = r._id;
    if (!map[country]) map[country] = { count: 0, cities: {} };
    map[country].count += r.count;
    map[country].cities[city] = (map[country].cities[city] || 0) + r.count;
  });

  return Object.entries(map).map(([country, data]) => ({
    country,
    count: data.count,
    cities: Object.entries(data.cities).map(([city, count]) => ({ city, count })),
  }));
}


const createStoryHandler = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user?._id?.toString() || req.body.userId || 'anonymous';
    const newStory = await createStoryDb(req.body, userId);
    res.status(201).json({ story: newStory });
  } catch (error) {
    console.error('createStoryHandler error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
};

const getApprovedStoriesHandler = async (req: Request, res: Response) => {
  try {
    // Allow pagination/filtering via query
    const filters = req.query as unknown as StoryFilters;
    const options: PaginationOptions = {
      offset: req.query.offset ? Number(req.query.offset) : 0,
      limit: req.query.limit ? Number(req.query.limit) : 12,
    };

    const stories = await fetchStoriesFromDb(filters, options, true);
    const total = await ExchangeStories.countDocuments(buildQuery(filters, true));
    const offset = options.offset ?? 0;
    const limit = options.limit ?? 12;
    res.json({ stories, total, hasMore: total > offset + limit });
  } catch (error) {
    console.error('getApprovedStoriesHandler error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
};

/**
 * Admin only, returning all stories both approved and not).
 * Returns the same shape as approved endpoint so frontend code can reuse it.
 */
const getAllStoriesHandler = async (req: Request, res: Response) => {
  try {
    const filters = req.query as unknown as StoryFilters;
    const options: PaginationOptions = {
      offset: req.query.offset ? Number(req.query.offset) : 0,
      limit: req.query.limit ? Number(req.query.limit) : 100,
    };

    const stories = await fetchStoriesFromDb(filters, options, false);
    const total = await ExchangeStories.countDocuments(buildQuery(filters, false));
    const offset = options.offset ?? 0;
    const limit = options.limit ?? 100;
    res.json({ stories, total, hasMore: total > offset + limit });
  } catch (error) {
    console.error('getAllStoriesHandler error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
};

const getStoryByIdHandler = async (req: Request, res: Response) => {
  try {
    const story = await getStoryByIdDb(req.params.id);
    if (!story) return res.status(404).json({ error: 'Story not found' });
    res.json({ story });
  } catch (error) {
    console.error('getStoryByIdHandler error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
};

const updateStoryHandler = async (req: Request, res: Response) => {
  try {
    const updated = await updateStoryDb(req.params.id, req.body);
    res.json({ story: updated });
  } catch (error) {
    console.error('updateStoryHandler error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
};

const deleteStoryHandler = async (req: Request, res: Response) => {
  try {
    const deleted = await deleteStoryDb(req.params.id);
    res.json({ story: deleted });
  } catch (error) {
    console.error('deleteStoryHandler error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
};

const approveStoryHandler = async (req: Request, res: Response) => {
  try {
    const approved = await approveStoryDb(req.params.id);
    res.json({ story: approved });
  } catch (error) {
    console.error('approveStoryHandler error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
};

const likeStoryHandler = async (req: Request, res: Response) => {
  try {
    const likes = await likeStoryDb(req.params.id);
    res.json({ likes });
  } catch (error) {
    console.error('likeStoryHandler error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
};

const getCountriesHandler = async (req: Request, res: Response) => {
  try {
    const countries = await getCountriesWithCountsDb();
    res.json({ countries });
  } catch (error) {
    console.error('getCountriesHandler error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
};

export {
  deleteStoryHandler,
  updateStoryHandler,
  getStoryByIdHandler,
  createStoryHandler,
  getApprovedStoriesHandler,
  getAllStoriesHandler,
  likeStoryHandler,
  getCountriesHandler,
  approveStoryHandler
};
