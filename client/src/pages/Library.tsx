import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Search, BookOpen, Clock, User, Tag, ArrowRight, Leaf } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { articles, articleCategories, getArticlesByCategory, searchArticles, getPillarArticles } from "@/lib/articles";
import { Helmet } from "react-helmet-async";

export default function Library() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Handle URL category parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    if (categoryParam && articleCategories.find(cat => cat.id === categoryParam)) {
      setSelectedCategory(categoryParam);
    }
  }, []);

  const filteredArticles = searchQuery 
    ? searchArticles(searchQuery)
    : selectedCategory 
      ? getArticlesByCategory(selectedCategory)
      : articles;

  const pillarArticles = getPillarArticles();

  return (
    <>
      <Helmet>
        <title>Educational Library - Comprehensive Breathwork Guide | breathwork.fyi</title>
        <meta name="description" content="Comprehensive educational library with 50+ expert-written articles on breathwork techniques, science, and applications. From beginner guides to advanced practices." />
        <meta name="keywords" content="breathwork education, breathing techniques, meditation guide, wellness library, stress relief, anxiety help" />
        <link rel="canonical" href="https://breathwork.fyi/library" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Educational Library - Comprehensive Breathwork Guide" />
        <meta property="og:description" content="Comprehensive educational library with 50+ expert-written articles on breathwork techniques, science, and applications." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://breathwork.fyi/library" />
        
        {/* Schema.org structured data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Breathwork Educational Library",
            "description": "Comprehensive educational library with 50+ expert-written articles on breathwork techniques, science, and applications.",
            "url": "https://breathwork.fyi/library",
            "mainEntity": {
              "@type": "ItemList",
              "numberOfItems": articles.length,
              "itemListElement": articles.map((article, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "item": {
                  "@type": "Article",
                  "headline": article.title,
                  "description": article.description,
                  "url": `https://breathwork.fyi/library/${article.slug}`,
                  "dateModified": article.lastUpdated,
                  "author": {
                    "@type": "Organization",
                    "name": "breathwork.fyi"
                  },
                  "publisher": {
                    "@type": "Organization",
                    "name": "breathwork.fyi"
                  }
                }
              }))
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-indigo-50/30 to-purple-50 dark:from-background dark:via-background dark:to-background">
        <Navbar />
        
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 dark:opacity-10" />
        
        <main className="relative pt-24 pb-16">
          <motion.div 
            className="container mx-auto px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <motion.header
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <div className="flex items-center justify-center gap-3 mb-6">
                <BookOpen className="h-8 w-8 text-primary" />
                <h1 className="text-4xl md:text-5xl font-bold text-primary">
                  Educational Library
                </h1>
              </div>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Comprehensive guides, techniques, and science-backed insights to deepen your breathwork practice. 
                From beginner foundations to advanced modalities.
              </p>
            </motion.header>

            {/* Search and Filter */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-12"
            >
              <div className="relative max-w-md mx-auto mb-8">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                >
                  All Articles ({articles.length})
                </Button>
                {articleCategories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.icon} {category.name}
                  </Button>
                ))}
              </div>
            </motion.div>

            {/* Pillar Articles Section */}
            {!searchQuery && !selectedCategory && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold text-center mb-8 text-primary">
                  🌟 Start Here: Essential Guides
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pillarArticles.map((article) => (
                    <Link 
                      key={article.id} 
                      href={`/library/${article.slug}`} 
                      className="block"
                      onClick={() => window.scrollTo(0, 0)}
                    >
                      <Card className="group hover:shadow-lg hover:scale-[1.02] hover:bg-accent/50 transition-all duration-300 cursor-pointer h-full min-h-[320px] border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                        <CardHeader>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <Clock className="h-4 w-4" />
                            {article.readTime}
                          </div>
                          <div className="mb-6">
                            <Badge variant="secondary" className="text-xs">
                              {articleCategories.find(c => c.id === article.category)?.name}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                            {article.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="mb-4 line-clamp-3">
                            {article.description}
                          </CardDescription>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">
                              {article.difficulty}
                            </Badge>
                            <Button variant="ghost" size="sm" className="pointer-events-none">
                              Read More <ArrowRight className="h-4 w-4 ml-1" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Visual Divider */}
            {!searchQuery && !selectedCategory && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
                className="mb-12"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-border"></div>
                  <div className="flex items-center justify-center">
                    <Leaf className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-l from-transparent via-border to-border"></div>
                </div>
              </motion.div>
            )}

            {/* Category Sections */}
            {!searchQuery && !selectedCategory && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold text-center mb-12 text-primary">
                  Browse by Category
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {articleCategories.map((category) => {
                    const categoryArticles = getArticlesByCategory(category.id);
                    return (
                      <Card key={category.id} className="group hover:shadow-lg transition-all duration-300">
                        <CardHeader>
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`w-10 h-10 rounded-full ${category.color} flex items-center justify-center text-white text-lg`}>
                              {category.icon}
                            </div>
                            <div>
                              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                                {category.name}
                              </CardTitle>
                              <p className="text-sm text-muted-foreground">
                                {categoryArticles.length} articles
                              </p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="mb-4">
                            {category.description}
                          </CardDescription>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setSelectedCategory(category.id)}
                            className="w-full"
                          >
                            Explore Articles <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </motion.section>
            )}

            {/* Visual Divider */}
            {!searchQuery && !selectedCategory && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="mb-12"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-border"></div>
                  <div className="flex items-center justify-center">
                    <Leaf className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-l from-transparent via-border to-border"></div>
                </div>
              </motion.div>
            )}

            {/* Articles Grid */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {searchQuery && (
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">
                    Search Results for "{searchQuery}"
                  </h2>
                  <p className="text-muted-foreground">
                    {filteredArticles.length} articles found
                  </p>
                </div>
              )}
              
              {selectedCategory && (
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">
                    {articleCategories.find(c => c.id === selectedCategory)?.name}
                  </h2>
                  <p className="text-muted-foreground">
                    {filteredArticles.length} articles in this category
                  </p>
                </div>
              )}

              {!searchQuery && !selectedCategory && (
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-center mb-4 text-primary">
                    All Articles
                  </h2>
                  <p className="text-center text-muted-foreground">
                    Browse our complete collection of {filteredArticles.length} expert-written guides
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.map((article) => (
                  <Link 
                    key={article.id} 
                    href={`/library/${article.slug}`} 
                    className="block"
                    onClick={() => window.scrollTo(0, 0)}
                  >
                    <Card className="group hover:shadow-lg hover:scale-[1.02] hover:bg-accent/50 transition-all duration-300 cursor-pointer h-full min-h-[320px]">
                      <CardHeader>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Clock className="h-4 w-4" />
                          {article.readTime}
                        </div>
                        <div className="mb-6">
                          <Badge variant="secondary" className="text-xs">
                            {articleCategories.find(c => c.id === article.category)?.name}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                          {article.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="mb-4 line-clamp-3">
                          {article.description}
                        </CardDescription>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {article.difficulty}
                          </Badge>
                          <Button variant="ghost" size="sm" className="pointer-events-none">
                            Read More <ArrowRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {filteredArticles.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No articles found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search query or browse by category.
                  </p>
                </div>
              )}
            </motion.section>
          </motion.div>
        </main>
        <Footer />
      </div>
    </>
  );
} 