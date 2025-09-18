import { WithContext } from "schema-dts";
import { Review, AggregateRating } from "schema-dts";

export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  verified: boolean;
  helpful: number;
  images?: string[];
  productId: string;
  variantId?: string;
}

export interface ReviewStats {
  average: number;
  total: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

/**
 * Generate review schema for structured data
 */
export function generateReviewSchema(
  review: ProductReview,
  productName: string,
  productUrl: string
): WithContext<Review> {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    "@id": `${productUrl}#review-${review.id}`,
    itemReviewed: {
      "@type": "Product",
      name: productName,
      "@id": productUrl,
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: review.rating.toString(),
      bestRating: "5",
      worstRating: "1",
    },
    author: {
      "@type": "Person",
      name: review.author,
    },
    datePublished: review.date,
    name: review.title,
    reviewBody: review.content,
    ...(review.verified && {
      verifiedPurchase: true,
    }),
    ...(review.helpful > 0 && {
      interactionStatistic: {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/LikeAction",
        userInteractionCount: review.helpful,
      },
    }),
  };
}

/**
 * Generate aggregate rating schema
 */
export function generateAggregateRatingSchema(
  stats: ReviewStats,
  productName: string
): WithContext<AggregateRating> {
  return {
    "@context": "https://schema.org",
    "@type": "AggregateRating",
    itemReviewed: {
      "@type": "Product",
      name: productName,
    },
    ratingValue: stats.average.toFixed(1),
    reviewCount: stats.total.toString(),
    bestRating: "5",
    worstRating: "1",
    ratingCount: stats.total.toString(),
  };
}

/**
 * Review display component with schema markup
 */
export function ReviewDisplay({ 
  review, 
  productName 
}: { 
  review: ProductReview; 
  productName: string;
}) {
  const stars = Array.from({ length: 5 }, (_, i) => i < review.rating);
  
  return (
    <div 
      itemScope 
      itemType="https://schema.org/Review"
      className="border-b pb-4 mb-4"
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2">
            <span 
              itemProp="author" 
              itemScope 
              itemType="https://schema.org/Person"
              className="font-semibold"
            >
              <span itemProp="name">{review.author}</span>
            </span>
            {review.verified && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                Verified Purchase
              </span>
            )}
          </div>
          <div 
            itemProp="reviewRating" 
            itemScope 
            itemType="https://schema.org/Rating"
            className="flex items-center gap-1 mt-1"
          >
            <meta itemProp="worstRating" content="1" />
            <meta itemProp="bestRating" content="5" />
            <meta itemProp="ratingValue" content={review.rating.toString()} />
            {stars.map((filled, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${filled ? 'text-yellow-400' : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        </div>
        <time 
          itemProp="datePublished" 
          dateTime={review.date}
          className="text-sm text-gray-500"
        >
          {new Date(review.date).toLocaleDateString()}
        </time>
      </div>
      
      <h3 itemProp="name" className="font-semibold mb-2">
        {review.title}
      </h3>
      
      <div itemProp="reviewBody" className="text-gray-700">
        {review.content}
      </div>
      
      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 mt-3">
          {review.images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`Review image ${i + 1}`}
              className="w-20 h-20 object-cover rounded"
            />
          ))}
        </div>
      )}
      
      {review.helpful > 0 && (
        <div className="mt-3 text-sm text-gray-500">
          {review.helpful} people found this helpful
        </div>
      )}
      
      {/* Hidden metadata for search engines */}
      <div className="hidden">
        <div itemProp="itemReviewed" itemScope itemType="https://schema.org/Product">
          <span itemProp="name">{productName}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Review summary component with aggregate rating
 */
export function ReviewSummary({ 
  stats, 
  productName 
}: { 
  stats: ReviewStats; 
  productName: string;
}) {
  const maxCount = Math.max(...Object.values(stats.distribution));
  
  return (
    <div 
      itemScope 
      itemType="https://schema.org/AggregateRating"
      className="bg-gray-50 rounded-lg p-6"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="text-center">
          <div className="text-4xl font-bold" itemProp="ratingValue">
            {stats.average.toFixed(1)}
          </div>
          <div className="flex gap-1 justify-center mt-1">
            {Array.from({ length: 5 }, (_, i) => (
              <svg
                key={i}
                className={`w-5 h-5 ${
                  i < Math.round(stats.average) ? 'text-yellow-400' : 'text-gray-300'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            <span itemProp="reviewCount">{stats.total}</span> reviews
          </div>
        </div>
        
        <div className="flex-1">
          {Object.entries(stats.distribution)
            .sort(([a], [b]) => Number(b) - Number(a))
            .map(([rating, count]) => (
              <div key={rating} className="flex items-center gap-2 mb-1">
                <span className="text-sm w-4">{rating}</span>
                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-400 rounded-full"
                    style={{ 
                      width: `${(count / maxCount) * 100}%` 
                    }}
                  />
                </div>
                <span className="text-sm text-gray-500 w-8 text-right">
                  {count}
                </span>
              </div>
            ))}
        </div>
      </div>
      
      {/* Hidden metadata */}
      <meta itemProp="bestRating" content="5" />
      <meta itemProp="worstRating" content="1" />
      <div className="hidden" itemProp="itemReviewed" itemScope itemType="https://schema.org/Product">
        <span itemProp="name">{productName}</span>
      </div>
    </div>
  );
}

/**
 * Mock review data generator for testing
 */
export function generateMockReviews(productId: string, count: number = 10): ProductReview[] {
  const names = ['John D.', 'Sarah M.', 'Mike R.', 'Emily S.', 'David L.'];
  const titles = [
    'Excellent product!',
    'Great value for money',
    'Highly recommended',
    'Good quality',
    'Works as expected',
    'Amazing results',
  ];
  const contents = [
    'This product exceeded my expectations. The quality is outstanding and delivery was fast.',
    'I\'ve been using this for weeks now and couldn\'t be happier with the results.',
    'Great product at a fair price. Would definitely buy again.',
    'Exactly what I was looking for. High quality and works perfectly.',
    'The best purchase I\'ve made this year. Highly recommend to everyone.',
  ];
  
  const reviews: ProductReview[] = [];
  
  for (let i = 0; i < count; i++) {
    const rating = Math.floor(Math.random() * 2) + 4; // 4-5 stars mostly
    reviews.push({
      id: `review-${i}`,
      author: names[Math.floor(Math.random() * names.length)],
      rating,
      title: titles[Math.floor(Math.random() * titles.length)],
      content: contents[Math.floor(Math.random() * contents.length)],
      date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      verified: Math.random() > 0.3,
      helpful: Math.floor(Math.random() * 50),
      productId,
    });
  }
  
  return reviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Calculate review statistics
 */
export function calculateReviewStats(reviews: ProductReview[]): ReviewStats {
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let totalRating = 0;
  
  reviews.forEach(review => {
    distribution[review.rating as keyof typeof distribution]++;
    totalRating += review.rating;
  });
  
  return {
    average: reviews.length > 0 ? totalRating / reviews.length : 0,
    total: reviews.length,
    distribution,
  };
}