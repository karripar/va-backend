import { Request, Response } from 'express';
import ExchangeStories from '../../models/ExchangeStoryModel';
import { PaginationOptions } from 'va-hybrid-types/contentTypes';
import type {StoryFilters, CreateStoryRequest, ExchangeStory, CountriesResponse} from 'va-hybrid-types/contentTypes';



export async function getApprovedStories(filters: StoryFilters = {}, options: PaginationOptions = {}): Promise<ExchangeStory[]> {
  const query: Record<string, unknown> = { isApproved: true };

  if (filters.country) query.country = filters.country;
  if (filters.city) query.city = filters.city;
  if (filters.search) query.$text = { $search: filters.search };
  if (filters.minRating) query['ratings.overall'] = { $gte: Number(filters.minRating) };
  if (filters.isFeatured !== undefined) query.isFeatured = filters.isFeatured;
  if (filters.tags) query.tags = { $in: filters.tags };

  let sort: Record<string, 1 | -1> = { createdAt: -1 };
  if (filters.sort === 'popular') sort = { likes: -1 };
  if (filters.sort === 'rating') sort = { 'ratings.overall': -1 };

  return ExchangeStories.find(query)
    .sort(sort)
    .skip(options.offset ?? 0)
    .limit(options.limit ?? 12)
    .lean<ExchangeStory[]>();
}
/* eslint-disable @typescript-eslint/no-explicit-any */
export async function getStoryById(_id: string): Promise<ExchangeStory | null> {
  const story = await ExchangeStories.findById(_id).lean();
  if (!story) return null;
  const { _id: mongoId, ...rest } = story as any;
  return { id: mongoId.toString(), ...rest } as ExchangeStory;
}

// Admin or authorized user creates story
export async function createStory(
  data: CreateStoryRequest,
  userId: string,
): Promise<ExchangeStory> {
  const story = await ExchangeStories.create({
    ...data,
    createdBy: userId,
    isApproved: false,
  });

  const { _id, ...rest } = story.toObject();
  return { id: _id.toString(), ...rest } as unknown as ExchangeStory;
}

export async function updateStory(_id: string, data: Partial<CreateStoryRequest>) {
  return ExchangeStories.findByIdAndUpdate(_id, data, { new: true }).lean();
}

export async function deleteStory(id: string) {
  return ExchangeStories.findByIdAndDelete(id).lean();
}

export async function approveStory(id: string) {
  return ExchangeStories.findByIdAndUpdate(id, { isApproved: true }, { new: true }).lean();
}

export async function likeStory(id: string): Promise<number> {
  const updated = await ExchangeStories.findByIdAndUpdate(
    id,
    { $inc: { likes: 1 } },
    { new: true },
  ).lean();
  return updated?.likes ?? 0;
}

export async function getCountriesWithCounts(): Promise<CountriesResponse['countries']> {
  const pipeline = [
    { $match: { isApproved: true } },
    { $group: { _id: { country: '$country', city: '$city' }, count: { $sum: 1 } } },
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
    cities: Object.entries(data.cities).map(([city, count]) => ({ city, count })),
  }));
}

export const createStoryHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user!._id.toString();
    const newStory = await createStory(req.body, userId);
    res.status(201).json(newStory);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getApprovedStoriesHandler = async (req: Request, res: Response) => {
  try {
    const stories = await getApprovedStories(req.query);
    res.json(stories);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getAllStoriesHandler = getApprovedStoriesHandler;

export const getStoryByIdHandler = async (req: Request, res: Response) => {
  try {
    const story = await getStoryById(req.params.id);
    if (!story) return res.status(404).json({ error: 'Story not found' });
    res.json(story);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const updateStoryHandler = async (req: Request, res: Response) => {
  try {
    const updated = await updateStory(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const deleteStoryHandler = async (req: Request, res: Response) => {
  try {
    const deleted = await deleteStory(req.params.id);
    res.json(deleted);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const approveStoryHandler = async (req: Request, res: Response) => {
  try {
    const approved = await approveStory(req.params.id);
    res.json(approved);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const likeStoryHandler = async (req: Request, res: Response) => {
  try {
    const likes = await likeStory(req.params.id);
    res.json({ likes });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getCountriesHandler = async (req: Request, res: Response) => {
  try {
    const countries = await getCountriesWithCounts();
    res.json(countries);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
