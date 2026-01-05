import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { productsAPI, categoriesAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import Loading from '../components/Loading';

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [featuredRes, dealsRes, bestSellersRes, newArrivalsRes, categoriesRes] = await Promise.all([
        productsAPI.getFeatured(),
        productsAPI.getDeals(),
        productsAPI.getBestSellers(),
        productsAPI.getNewArrivals(),
        categoriesAPI.getAll()
      ]);

      setFeaturedProducts(featuredRes.data.products);
      setDeals(dealsRes.data.products);
      setBestSellers(bestSellersRes.data.products);
      setNewArrivals(newArrivalsRes.data.products);
      setCategories(categoriesRes.data.categories);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const heroSlides = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600',
      title: 'Great Indian Festival',
      subtitle: 'Up to 70% Off on Electronics',
      link: '/products?category=electronics'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600',
      title: 'Fashion Sale',
      subtitle: 'Latest Trends at Best Prices',
      link: '/products?category=fashion'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1600',
      title: 'Home & Kitchen',
      subtitle: 'Transform Your Space',
      link: '/products?category=home-kitchen'
    }
  ];

  if (loading) {
    return <Loading />;
  }

  const ProductSection = ({ title, products, link, linkText = 'See all deals' }) => (
    <section className="bg-white dark:bg-gray-800 p-3 sm:p-4 md:p-5 rounded-lg shadow">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
        <Link to={link} className="text-amazon-blue hover:text-amazon-orange text-xs sm:text-sm hover:underline whitespace-nowrap">
          {linkText}
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
        {products.slice(0, 6).map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Hero Carousel */}
      <section className="relative">
        <Swiper
          modules={[Autoplay, Navigation, Pagination]}
          spaceBetween={0}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          loop
          className="hero-height"
        >
          {heroSlides.map((slide) => (
            <SwiperSlide key={slide.id}>
              <Link to={slide.link} className="relative block w-full h-full">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 lg:bottom-10 left-4 sm:left-6 md:left-8 lg:left-10 text-white">
                  <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-1 sm:mb-2">{slide.title}</h2>
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl">{slide.subtitle}</p>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-24 md:h-32 bg-gradient-to-t from-gray-100 dark:from-gray-900 to-transparent z-10" />
      </section>

      {/* Category Cards */}
      <section className="relative -mt-8 sm:-mt-12 md:-mt-16 lg:-mt-20 z-20 max-w-7xl mx-auto px-3 sm:px-4" style={{marginTop:"10px"}}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
          {categories.map((category) => (
            <Link
              key={category._id}
              to={`/category/${category.slug}`}
              className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white mb-2 line-clamp-1">{category.name}</h3>
              <img
                src={category.image || 'https://via.placeholder.com/200'}
                alt={category.name}
                className="w-full h-20 sm:h-24 md:h-28 lg:h-32 object-cover rounded"
              />
              <p className="text-amazon-blue text-xs sm:text-sm mt-2 hover:text-amazon-orange hover:underline">
                Shop now
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6 md:space-y-8">
        {/* Deals of the Day */}
        {deals.length > 0 && (
          <section className="bg-white dark:bg-gray-800 p-3 sm:p-4 md:p-5 rounded-lg shadow">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div>
                <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white">Today's Deals</h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Ends in limited time</p>
              </div>
              <Link to="/products?deals=true" className="text-amazon-blue hover:text-amazon-orange text-xs sm:text-sm hover:underline whitespace-nowrap">
                See all deals
              </Link>
            </div>
            <Swiper
              modules={[Navigation]}
              spaceBetween={8}
              slidesPerView={2}
              navigation
              className="deals-swiper"
              breakpoints={{
                480: { slidesPerView: 2, spaceBetween: 12 },
                640: { slidesPerView: 3, spaceBetween: 12 },
                768: { slidesPerView: 4, spaceBetween: 16 },
                1024: { slidesPerView: 5, spaceBetween: 16 },
                1280: { slidesPerView: 6, spaceBetween: 16 }
              }}
            >
              {deals.map((product) => (
                <SwiperSlide key={product._id}>
                  <ProductCard product={product} />
                </SwiperSlide>
              ))}
            </Swiper>
          </section>
        )}

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <ProductSection
            title="Featured Products"
            products={featuredProducts}
            link="/products?featured=true"
            linkText="See all"
          />
        )}

        {/* Best Sellers */}
        {bestSellers.length > 0 && (
          <section className="bg-white dark:bg-gray-800 p-3 sm:p-4 md:p-5 rounded-lg shadow">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white">Best Sellers</h2>
              <Link to="/products?bestSeller=true" className="text-amazon-blue hover:text-amazon-orange text-xs sm:text-sm hover:underline">
                See more
              </Link>
            </div>
            <Swiper
              modules={[Navigation]}
              spaceBetween={8}
              slidesPerView={2}
              navigation
              className="deals-swiper"
              breakpoints={{
                480: { slidesPerView: 2, spaceBetween: 12 },
                640: { slidesPerView: 3, spaceBetween: 12 },
                768: { slidesPerView: 4, spaceBetween: 16 },
                1024: { slidesPerView: 5, spaceBetween: 16 },
                1280: { slidesPerView: 6, spaceBetween: 16 }
              }}
            >
              {bestSellers.map((product) => (
                <SwiperSlide key={product._id}>
                  <ProductCard product={product} />
                </SwiperSlide>
              ))}
            </Swiper>
          </section>
        )}

        {/* Browse by Category */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {categories.slice(0, 4).map((category) => (
            <div key={category._id} className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow">
              <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white mb-2 sm:mb-3">{category.name}</h3>
              <div className="grid grid-cols-2 gap-2">
                {category.subcategories?.slice(0, 4).map((sub, index) => (
                  <Link
                    key={index}
                    to={`/category/${category.slug}?sub=${sub.slug}`}
                    className="text-center"
                  >
                    <div className="bg-gray-100 dark:bg-gray-700 rounded aspect-square mb-1 flex items-center justify-center">
                      <span className="text-xl sm:text-2xl">{category.icon || '📦'}</span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 line-clamp-1">{sub.name}</p>
                  </Link>
                ))}
              </div>
              <Link
                to={`/category/${category.slug}`}
                className="text-amazon-blue text-xs sm:text-sm mt-2 sm:mt-3 block hover:text-amazon-orange hover:underline"
              >
                See more
              </Link>
            </div>
          ))}
        </section>

        {/* New Arrivals */}
        {newArrivals.length > 0 && (
          <section className="bg-white dark:bg-gray-800 p-3 sm:p-4 md:p-5 rounded-lg shadow">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white">New Arrivals</h2>
              <Link to="/products?newArrival=true" className="text-amazon-blue hover:text-amazon-orange text-xs sm:text-sm hover:underline">
                See more
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
              {newArrivals.slice(0, 6).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Promotional Banners */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <Link
            to="/products?category=electronics"
            className="relative overflow-hidden rounded-lg group"
          >
            <img
              src="https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800"
              alt="Electronics Sale"
              className="w-full h-32 sm:h-40 md:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-center">
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1 sm:mb-2">Electronics Sale</h3>
                <p className="text-white/80 text-sm sm:text-base mb-1 sm:mb-2">Up to 50% off</p>
                <span className="text-amazon-orange text-sm sm:text-base font-medium">Shop Now →</span>
              </div>
            </div>
          </Link>
          <Link
            to="/products?category=fashion"
            className="relative overflow-hidden rounded-lg group"
          >
            <img
              src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=800"
              alt="Fashion Week"
              className="w-full h-32 sm:h-40 md:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-center">
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1 sm:mb-2">Fashion Week</h3>
                <p className="text-white/80 text-sm sm:text-base mb-1 sm:mb-2">Trending styles</p>
                <span className="text-amazon-orange text-sm sm:text-base font-medium">Shop Now →</span>
              </div>
            </div>
          </Link>
        </section>
      </div>
    </div>
  );
};

export default Home;
