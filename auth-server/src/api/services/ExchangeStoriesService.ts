import ExchangeStories from '../models/ExchangeStoryModel';
import type { StoryFilters, CreateStoryRequest, ExchangeStory, CountriesResponse} from 'va-hybrid-types/contentTypes';

type PaginationOptions = {
  offset?: number;
  limit?: number;
};

// Getting all approved stories with  filters
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

  const stories = await ExchangeStories.find(query)
    .sort(sort)
    .skip(options.offset ?? 0)
    .limit(options.limit ?? 12)
    .lean<ExchangeStory[]>();

  return stories;
}

// Getting single story by ID
export async function getStoryById(_id: string): Promise<ExchangeStory | null> {
  return ExchangeStories.findById(_id).lean<ExchangeStory | null>();
}

// Creating new story, Admin only can do this
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

//Updating story
export async function updateStory(
  _id: string,
  data: Partial<CreateStoryRequest>
): Promise<ExchangeStory | null> {
  return ExchangeStories.findByIdAndUpdate(_id, data, {
    new: true
  }).lean<ExchangeStory | null>();
}

// Delete story, Admin only
export async function deleteStory(id: string): Promise<ExchangeStory | null> {
  return ExchangeStories.findByIdAndDelete(id).lean<ExchangeStory | null>();
}

// Approve story for publication, Admin only
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

// Get list of all countries with story counts
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

    if (!map[country]) {
      map[country] = { count: 0, cities: {} };
    }

    map[country].count += r.count;
    map[country].cities[city] = (map[country].cities[city] || 0) + r.count;
  });

  return Object.entries(map).map(([country, data]) => ({
    country,
    count: data.count,
    cities: Object.entries(data.cities).map(([city, count]) => ({
      city,
      count
    }))
  }));
}

