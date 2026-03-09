export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      newsletter_subscribers: {
        Row: NewsletterSubscriber;
        Insert: Omit<NewsletterSubscriber, 'id' | 'created_at'>;
        Update: Partial<Omit<NewsletterSubscriber, 'id'>>;
      };
      forum_categories: {
        Row: ForumCategory;
        Insert: Omit<ForumCategory, 'id' | 'created_at' | 'post_count'>;
        Update: Partial<Omit<ForumCategory, 'id'>>;
      };
      forum_posts: {
        Row: ForumPostRow;
        Insert: Omit<ForumPostRow, 'id' | 'created_at' | 'updated_at' | 'views' | 'reply_count'>;
        Update: Partial<Omit<ForumPostRow, 'id'>>;
      };
      forum_replies: {
        Row: ForumReplyRow;
        Insert: Omit<ForumReplyRow, 'id' | 'created_at'>;
        Update: Partial<Omit<ForumReplyRow, 'id'>>;
      };
      recommendations: {
        Row: Recommendation;
        Insert: Omit<Recommendation, 'id' | 'created_at' | 'average_rating' | 'review_count'>;
        Update: Partial<Omit<Recommendation, 'id'>>;
      };
      reviews: {
        Row: Review;
        Insert: Omit<Review, 'id' | 'created_at' | 'helpful_count'>;
        Update: Partial<Omit<Review, 'id'>>;
      };
    };
  };
}

export type NewsletterSubscriber = {
  id: string;
  email: string;
  first_name: string;
  tags: string[];
  frequency: 'weekly' | 'immediate';
  confirmed: boolean;
  confirmation_token: string | null;
  weekend_digest: boolean;
  created_at: string;
};

export type ForumCategory = {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  post_count: number;
  created_at: string;
};

// Raw DB row (no joins)
export type ForumPostRow = {
  id: string;
  title: string;
  body: string | null;
  category_id: string | null;
  author_id: string | null;
  author_name: string;
  author_email: string | null;
  zip_code: string | null;
  views: number;
  reply_count: number;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
};

// With joined category
export type ForumPost = ForumPostRow & {
  forum_categories?: { name: string; slug: string } | null;
};

// Raw DB row (no joins)
export type ForumReplyRow = {
  id: string;
  post_id: string;
  body: string;
  author_id: string | null;
  author_name: string;
  zip_code: string | null;
  created_at: string;
};

export type ForumReply = ForumReplyRow;

export type Recommendation = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  address: string | null;
  town: string | null;
  zipcode: string | null;
  phone: string | null;
  website: string | null;
  average_rating: number;
  review_count: number;
  submitted_by: string | null;
  created_at: string;
};

export type Review = {
  id: string;
  recommendation_id: string;
  author_id: string;
  author_name: string;
  rating: number;
  body: string;
  zipcode: string;
  helpful_count: number;
  created_at: string;
};

export type EventSubmissionRow = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  town: string;
  category: string;
  description: string | null;
  tags: string[];
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
  reviewed_at: string | null;
  submitter_name: string;
  submitter_email: string;
  created_at: string;
};
