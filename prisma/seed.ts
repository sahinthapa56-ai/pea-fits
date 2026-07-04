import { PrismaClient, Role, OrderStatus, PaymentStatus } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SIZES = ["XS", "S", "M", "L", "XL", "2XL"] as const;
const COLORS = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Burgundy", hex: "#800020" },
  { name: "Navy", hex: "#000080" },
  { name: "Olive", hex: "#556B2F" },
  { name: "Charcoal", hex: "#36454F" },
  { name: "Blush", hex: "#DE5D83" },
  { name: "Cream", hex: "#FFFDD0" },
  { name: "Camel", hex: "#C19A6B" },
] as const;

const NEPAL_CITIES = ["Kathmandu", "Pokhara", "Lalitpur", "Bhaktapur", "Bharatpur", "Chitwan"] as const;

async function main() {
  console.log("🌱 Seeding PEA_FITS database...\n");

  // ── Clean existing data ──
  await prisma.$transaction([
    prisma.wishlistItem.deleteMany(),
    prisma.review.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.cartItem.deleteMany(),
    prisma.collectionItem.deleteMany(),
    prisma.collection.deleteMany(),
    prisma.productImage.deleteMany(),
    prisma.productVariant.deleteMany(),
    prisma.product.deleteMany(),
    prisma.category.deleteMany(),
    prisma.journalArticle.deleteMany(),
    prisma.brandBookSection.deleteMany(),
    prisma.newsletterSubscriber.deleteMany(),
    prisma.contactMessage.deleteMany(),
    prisma.siteSettings.deleteMany(),
    prisma.session.deleteMany(),
    prisma.account.deleteMany(),
    prisma.user.deleteMany(),
  ]);
  console.log("  ✓ Cleaned existing data");

  // ── Admin User ──
  const adminPassword = await bcrypt.hash("Admin@123", 12);
  const admin = await prisma.user.create({
    data: {
      email: "admin@peafits.com",
      name: "Sahin Thapa",
      hashedPassword: adminPassword,
      role: "SUPER_ADMIN",
      phone: "9800000000",
      shippingAddress: { line1: "Durbar Marg", city: "Kathmandu", province: "Bagmati", zip: "44600", country: "Nepal" },
    },
  });

  const customerPassword = await bcrypt.hash("Customer@123", 12);
  const customer = await prisma.user.create({
    data: {
      email: "customer@example.com",
      name: "Anjali Sharma",
      hashedPassword: customerPassword,
      role: "CUSTOMER",
      phone: "9812345678",
      shippingAddress: { line1: "Jhamsikhel, Lalitpur", city: "Lalitpur", province: "Bagmati", zip: "44700", country: "Nepal" },
    },
  });

  console.log("  ✓ Created admin & customer users");

  // ── Review Users ──
  const reviewerData = [
    { email: "priya@example.com", name: "Priya Adhikari" },
    { email: "sneha@example.com", name: "Sneha Gurung" },
    { email: "ravi@example.com", name: "Ravi Shrestha" },
    { email: "mina@example.com", name: "Mina Rai" },
  ];
  const reviewerPassword = await bcrypt.hash("Reviewer@123", 12);
  const reviewers: Awaited<ReturnType<typeof prisma.user.create>>[] = [];
  for (const r of reviewerData) {
    reviewers.push(
      await prisma.user.create({
        data: {
          email: r.email,
          name: r.name,
          hashedPassword: reviewerPassword,
          role: "CUSTOMER",
        },
      })
    );
  }
  const allReviewUsers = [customer, ...reviewers];

  // ── Categories ──
  const categories = await Promise.all([
    prisma.category.create({ data: { name: "Bodycon & Fits", slug: "bodycon-fits", description: "Body-hugging silhouettes that command attention.", sortOrder: 1 } }),
    prisma.category.create({ data: { name: "Blazers & Tailoring", slug: "blazers-tailoring", description: "Sharp, architectural outerwear.", sortOrder: 2 } }),
    prisma.category.create({ data: { name: "Skirts & Bottoms", slug: "skirts-bottoms", description: "Flowing and structured silhouettes.", sortOrder: 3 } }),
    prisma.category.create({ data: { name: "Gowns & Evening", slug: "gowns-evening", description: "Red-carpet ready opulence.", sortOrder: 4 } }),
    prisma.category.create({ data: { name: "Tops & Bodysuits", slug: "tops-bodysuits", description: "Essentials that elevate.", sortOrder: 5 } }),
    prisma.category.create({ data: { name: "Accessories", slug: "accessories", description: "The finishing touch.", sortOrder: 6 } }),
  ]);

  console.log("  ✓ Created categories");

  // ── Collections ──
  const collections = await Promise.all([
    prisma.collection.create({ data: { name: "The Signature", slug: "the-signature", description: "Our foundational collection — timeless pieces designed for the modern wardrobe.", sortOrder: 1 } }),
    prisma.collection.create({ data: { name: "Dark Romance", slug: "dark-romance", description: "Burgundy, black, and deep crimson — a moody exploration of feminine strength.", sortOrder: 2 } }),
    prisma.collection.create({ data: { name: "Soft Armor", slug: "soft-armor", description: "Structured pieces that feel like protection, tailored like a second skin.", sortOrder: 3 } }),
    prisma.collection.create({ data: { name: "Metamorphosis", slug: "metamorphosis", description: "The latest evolution — where architectural precision meets fluid grace.", sortOrder: 4, isActive: false } }),
    prisma.collection.create({ data: { name: "The Archive", slug: "the-archive", description: "Past collections preserved — limited pieces from our design history.", sortOrder: 5 } }),
  ]);

  console.log("  ✓ Created collections");

  // ── 9 New Products with your new images ──
  const productData = [
    {
      name: "The Power Bodycon",
      slug: "the-power-bodycon",
      description: "An architectural silhouette crafted from heavy-weight stretch silk rib, designed to contour the body with effortless precision. Features seamless knit construction, a high-neck profile, and mid-calf length that creates an elongated, sculptural line. The fabric's subtle sheen catches light with every movement, embodying quiet luxury.",
      shortDescription: "Architectural heavy-weight silk rib bodycon.",
      category: "bodycon-fits",
      basePrice: 28500,
      salePrice: null,
      isOnSale: false,
      isNew: true,
      isFeatured: true,
      isTrending: true,
      isBestSeller: false,
      brand: "PEA_FITS",
      tags: JSON.stringify(["bodycon", "signature", "silk", "architectural"]),
      material: "100% heavy-weight mulberry silk rib",
      careInstructions: "Dry clean only. Store flat or on padded hanger. Avoid direct sunlight.",
      stockQuantity: 20,
      collections: ["the-signature"],
      colors: ["Charcoal", "White", "Black"],
      images: [
        { url: "/products/product-01.png", alt: "The Power Bodycon - Front View", isPrimary: true },
      ],
    },
    {
      name: "Tailored Noir Blazer",
      slug: "tailored-noir-blazer",
      description: "A masterclass in structural tailoring. The Tailored Noir Blazer features precision-engineered shoulder architecture, a nipped waist, and a single-button closure that creates the definitive power silhouette. Crafted from Italian virgin wool crepe with full floating canvas construction — 40+ hours of hand-finishing per garment.",
      shortDescription: "Italian wool crepe blazer with architectural shoulders.",
      category: "blazers-tailoring",
      basePrice: 42000,
      salePrice: null,
      isOnSale: false,
      isNew: true,
      isFeatured: true,
      isTrending: true,
      isBestSeller: true,
      brand: "PEA_FITS",
      tags: JSON.stringify(["blazer", "tailoring", "wool", "signature"]),
      material: "96% Virgin Wool, 4% Elastane. Lining: 100% Italian Silk",
      careInstructions: "Dry clean only by luxury garment specialists. Store on structured hanger.",
      stockQuantity: 15,
      collections: ["the-signature", "soft-armor"],
      colors: ["Black", "Charcoal"],
      images: [
        { url: "/products/product-02.png", alt: "Tailored Noir Blazer - Front View", isPrimary: true },
      ],
    },
    {
      name: "Midnight Fall Gown",
      slug: "midnight-fall-gown",
      description: "A floor-sweeping gown for evenings that demand presence. Cut on the bias from liquid satin-backed crepe, with a plunging V-neckline, open back, and a subtle train. The fabric catches every light source, creating a luminous effect with every step. Available in Black, Burgundy, and Navy.",
      shortDescription: "Floor-sweeping liquid satin gown with open back.",
      category: "gowns-evening",
      basePrice: 55000,
      salePrice: null,
      isOnSale: false,
      isNew: true,
      isFeatured: true,
      isTrending: true,
      isBestSeller: false,
      brand: "PEA_FITS",
      tags: JSON.stringify(["gown", "evening", "satin", "dark-romance"]),
      material: "Liquid satin-backed crepe (92% Silk, 8% Elastane)",
      careInstructions: "Dry clean only. Hang in garment bag. Store flat.",
      stockQuantity: 10,
      collections: ["dark-romance", "the-signature"],
      colors: ["Black", "Burgundy", "Navy"],
      images: [
        { url: "/products/product-03.png", alt: "Midnight Fall Gown - Front View", isPrimary: true },
      ],
    },
    {
      name: "Draped Halter Gown",
      slug: "draped-halter-gown",
      description: "An architectural halter gown that redefines evening elegance. Cut from 92% silk with 8% elastane for the perfect balance of fluid drape and structural hold. The draped halter neckline creates a sculptural silhouette, while the floor-length hem and open back exude understated sensuality. Available in Camel, Noir, and Ivory.",
      shortDescription: "Architectural silk halter gown with draped neckline.",
      category: "gowns-evening",
      basePrice: 65000,
      salePrice: null,
      isOnSale: false,
      isNew: true,
      isFeatured: true,
      isTrending: true,
      isBestSeller: false,
      brand: "PEA_FITS",
      tags: JSON.stringify(["gown", "halter", "silk", "evening"]),
      material: "92% Silk, 8% Elastane — GOTS certified organic silk",
      careInstructions: "Dry clean only. Hand-finished in our atelier. Store in garment bag.",
      stockQuantity: 8,
      collections: ["the-signature", "soft-armor"],
      colors: ["Camel", "Black", "White"],
      images: [
        { url: "/products/product-04.png", alt: "Draped Halter Gown - Front View", isPrimary: true },
      ],
    },
    {
      name: "Sculpted Noir Maxi",
      slug: "sculpted-noir-maxi",
      description: "A masterclass in structural fluidity. The Sculpted Noir Maxi features a precision-engineered wrap bodice with an asymmetric front slit that creates a dynamic silhouette. Crafted from heavy-weight crepe with 96% Virgin Wool and 4% Elastane, lined in 100% Italian Silk — offering substantial hold while maintaining a graceful, liquid drape.",
      shortDescription: "Structural fluidity in virgin wool crepe maxi.",
      category: "gowns-evening",
      basePrice: 85000,
      salePrice: null,
      isOnSale: false,
      isNew: true,
      isFeatured: true,
      isTrending: false,
      isBestSeller: false,
      brand: "PEA_FITS",
      tags: JSON.stringify(["maxi", "wool", "crepe", "evening"]),
      material: "96% Virgin Wool, 4% Elastane. Lining: 100% Italian Silk",
      careInstructions: "Dry clean only by luxury garment specialists. Handle with reverence. Store in garment bag.",
      stockQuantity: 6,
      collections: ["the-signature", "soft-armor"],
      colors: ["Black", "Charcoal"],
      images: [
        { url: "/products/product-05.png", alt: "Sculpted Noir Maxi - Front View", isPrimary: true },
      ],
    },
    {
      name: "Sheer Sleeve Bodycon",
      slug: "sheer-sleeve-bodycon",
      description: "A masterpiece of Atelier Minimalism — this body-sculpting silhouette combines architectural rigor with tactile warmth. Crafted from signature heavy-weight stretch jersey with ethereal sheer chiffon sleeves that catch the light with every movement. Features ruched side-seam detailing and a sophisticated square neckline construction.",
      shortDescription: "Body-sculpting silhouette with sheer chiffon sleeves.",
      category: "bodycon-fits",
      basePrice: 32000,
      salePrice: null,
      isOnSale: false,
      isNew: true,
      isFeatured: true,
      isTrending: true,
      isBestSeller: false,
      brand: "PEA_FITS",
      tags: JSON.stringify(["bodycon", "chiffon", "sleeve", "dark-romance"]),
      material: "Heavy-weight stretch jersey with sheer chiffon sleeves",
      careInstructions: "Dry clean only. Hand-finished. Store on padded hanger.",
      stockQuantity: 12,
      collections: ["dark-romance", "the-signature"],
      colors: ["Burgundy", "Black"],
      images: [
        { url: "/products/product-06.png", alt: "Sheer Sleeve Bodycon - Front View", isPrimary: true },
      ],
    },
    {
      name: "The Corset Bodysuit",
      slug: "the-corset-bodysuit",
      description: "A reimagined corset as a modern bodysuit. Built-in boning, adjustable lace-up back, and snap closure at the gusset. Worn tucked into high-waist skirts or peeking under an open blazer — the ultimate foundation piece for architectural dressing.",
      shortDescription: "Modern corset bodysuit with steel boning.",
      category: "tops-bodysuits",
      basePrice: 12500,
      salePrice: 9900,
      isOnSale: true,
      isNew: false,
      isFeatured: false,
      isTrending: false,
      isBestSeller: true,
      brand: "PEA_FITS",
      tags: JSON.stringify(["bodysuit", "corset", "boning", "foundation"]),
      material: "Cotton-blend structured satin with steel boning",
      careInstructions: "Hand wash cold. Lay flat to dry. Do not wring.",
      stockQuantity: 30,
      collections: ["the-signature", "soft-armor"],
      colors: ["Black", "White", "Blush"],
      images: [
        { url: "/products/product-07.png", alt: "The Corset Bodysuit - Front View", isPrimary: true },
      ],
    },
    {
      name: "Silk Ribbed Midi Skirt",
      slug: "silk-ribbed-midi-skirt",
      description: "The perfect complement to any architectural top. This midi skirt features the same heavy-weight silk rib as our signature bodycon, with a precision-tailored high waist and a subtle A-line that creates movement without volume. Side zip closure, fully lined in silk habotai.",
      shortDescription: "Midi skirt in signature heavy-weight silk rib.",
      category: "skirts-bottoms",
      basePrice: 18500,
      salePrice: null,
      isOnSale: false,
      isNew: true,
      isFeatured: false,
      isTrending: false,
      isBestSeller: false,
      brand: "PEA_FITS",
      tags: JSON.stringify(["skirt", "midi", "silk", "ribbed"]),
      material: "100% heavy-weight mulberry silk rib. Lining: Silk habotai",
      careInstructions: "Dry clean only. Store flat. Avoid direct sunlight.",
      stockQuantity: 15,
      collections: ["the-signature"],
      colors: ["Charcoal", "White", "Black"],
      images: [
        { url: "/products/product-08.png", alt: "Silk Ribbed Midi Skirt - Front View", isPrimary: true },
      ],
    },
    {
      name: "Architectural Silk Shirt",
      slug: "architectural-silk-shirt",
      description: "An elevated essential — this shirt redefines the classic white button-down through architectural precision. Cut from 100% Japanese silk habotai with French seams, mother-of-pearl buttons, and a precisely engineered collar stand that frames the neck. Features a curved hem for versatile styling — tucked or untucked.",
      shortDescription: "Japanese silk habotai shirt with architectural collar.",
      category: "tops-bodysuits",
      basePrice: 16500,
      salePrice: null,
      isOnSale: false,
      isNew: true,
      isFeatured: false,
      isTrending: false,
      isBestSeller: false,
      brand: "PEA_FITS",
      tags: JSON.stringify(["shirt", "silk", "habotai", "classic"]),
      material: "100% Japanese silk habotai. Buttons: Mother-of-pearl",
      careInstructions: "Dry clean recommended. Cool iron inside out. Store on padded hanger.",
      stockQuantity: 20,
      collections: ["the-signature", "metamorphosis"],
      colors: ["White", "Cream", "Camel"],
      images: [
        { url: "/products/product-09.png", alt: "Architectural Silk Shirt - Front View", isPrimary: true },
      ],
    },
  ];

  const createdProducts = [];
  for (const p of productData) {
    const category = categories.find((c) => c.slug === p.category)!;
    const product = await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        shortDescription: p.shortDescription,
        categoryId: category.id,
        basePrice: p.basePrice,
        salePrice: p.salePrice,
        isOnSale: p.isOnSale,
        isNew: p.isNew,
        isFeatured: p.isFeatured,
        isTrending: p.isTrending,
        isBestSeller: p.isBestSeller,
        brand: p.brand,
        tags: p.tags,
        material: p.material,
        careInstructions: p.careInstructions,
        stockQuantity: p.stockQuantity,
        inStock: p.stockQuantity > 0,
      },
    });

    // Create variants for each size × color combo
    const variantsPerColor = Math.min(SIZES.length, 4);
    const variantCount = p.colors.length * variantsPerColor;
    const stockPerVariant = Math.floor(p.stockQuantity / variantCount) || 1;
    let variantIndex = 0;
    for (const colorName of p.colors) {
      const color = COLORS.find((c) => c.name === colorName)!;
      for (let s = 0; s < variantsPerColor; s++) {
        const isOutOfStock = variantIndex % 5 === 0; // ~20% out of stock
        await prisma.productVariant.create({
          data: {
            productId: product.id,
            size: SIZES[s],
            color: colorName,
            colorHex: color.hex,
            sku: `${p.slug.toUpperCase().replace(/-/g, "_")}_${colorName.toUpperCase()}_${SIZES[s]}`,
            price: null,
            stock: isOutOfStock ? 0 : stockPerVariant,
            isActive: true,
          },
        });
        variantIndex++;
      }
    }

    // Create images
    for (let i = 0; i < p.images.length; i++) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: p.images[i].url,
          alt: p.images[i].alt,
          isPrimary: p.images[i].isPrimary,
          sortOrder: i,
        },
      });
    }

    // Link to collections
    for (const collSlug of p.collections) {
      const collection = collections.find((c) => c.slug === collSlug)!;
      await prisma.collectionItem.create({
        data: {
          collectionId: collection.id,
          productId: product.id,
        },
      });
    }

    createdProducts.push(product);
  }
  console.log(`  ✓ Created ${createdProducts.length} products with variants and images`);

  // ── Reviews ──
  const reviewTexts = [
    { rating: 5, title: "Absolutely stunning", comment: "The quality and fit exceeded my expectations. The fabric feels luxurious and the tailoring is impeccable." },
    { rating: 5, title: "Perfect silhouette", comment: "I've received so many compliments. The cut is incredibly flattering and the material drapes beautifully." },
    { rating: 4, title: "Beautiful but size up", comment: "Gorgeous design and high quality materials. I'd recommend sizing up one size for the perfect fit." },
    { rating: 5, title: "Worth every rupee", comment: "This is my third purchase from PEA_FITS and they never disappoint. The craftsmanship is outstanding." },
    { rating: 4, title: "Elegant design", comment: "The attention to detail is remarkable. Perfect for formal events." },
  ];

  for (const product of createdProducts) {
    let reviewIdx = 0;
    for (const review of reviewTexts) {
      const reviewer = allReviewUsers[reviewIdx % allReviewUsers.length];
      reviewIdx++;
      await prisma.review.create({
        data: {
          productId: product.id,
          userId: reviewer.id,
          rating: review.rating,
          title: review.title,
          comment: review.comment,
          isApproved: true,
        },
      });
    }
  }
  console.log("  ✓ Created sample reviews");

  // ── Journal Posts ──
  const journalPosts = [
    {
      title: "The Philosophy of Architectural Silhouettes",
      slug: "philosophy-architectural-silhouettes",
      excerpt: "Exploring how PEA_FITS translates architectural principles into garment construction — where line, volume, and proportion converge.",
      content: `<h2>Where Architecture Meets Fashion</h2>
<p>At PEA_FITS, we approach garment construction the way an architect approaches a building. Every seam is a structural element. Every silhouette is a study in proportion. Every fabric choice is selected for how it holds its shape — or how it falls.</p>
<p>Our Creative Director, Sahin Thapa, draws inspiration from modernist architecture — the clean lines of Tadao Ando, the sculptural forms of Zaha Hadid, the disciplined minimalism of Diébédo Francis Kéré.</p>
<blockquote>"We don't just design garments. We sculpt confidence." — Sahin Thapa</blockquote>
<p>This philosophy manifests in our signature elements: architectural shoulder lines, integrated waist shaping, continuous vertical seams that elongate the figure, and fabric weights that hold their sculpted form throughout the day.</p>
<h2>The Three Principles</h2>
<p><strong>Line.</strong> Every garment follows a continuous visual line that guides the eye and shapes perception of the body.</p>
<p><strong>Volume.</strong> We manipulate volume — adding structure where it empowers, removing it where it liberates.</p>
<p><strong>Proportion.</strong> Our silhouettes are mathematically considered to create ideal proportions regardless of body type.</p>`,
      coverImage: "https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=1200&q=80",
      category: "Design Philosophy",
      tags: JSON.stringify(["architecture", "design", "silhouette", "craftsmanship"]),
      isPublished: true,
      publishedAt: new Date("2025-12-15"),
    },
    {
      title: "Behind the Seams: Crafting the Signature Blazer",
      slug: "behind-the-seams-signature-blazer",
      excerpt: "An intimate look at how our Tailored Noir Blazer goes from concept to closet — with over 40 hours of hand-finishing.",
      content: `<h2>40 Hours of Craftsmanship</h2>
<p>Every Tailored Noir Blazer represents over 40 hours of skilled hand-finishing. From the initial pattern-cutting to the final press, our atelier follows traditional tailoring techniques passed down through generations of master artisans.</p>
<p>The journey begins with fabric selection. Our Italian wool-blend crepe is sourced from a family-run mill in Biella, Italy — a region renowned for suiting fabrics since the 19th century.</p>
<h2>The Construction Process</h2>
<p><strong>Step 1: Pattern Making.</strong> Each size is individually drafted and tested on a live fit model before production begins.</p>
<p><strong>Step 2: Cutting.</strong> Every panel is single-cut by hand — no stacked cutting, ensuring perfect alignment of pattern and grain.</p>
<p><strong>Step 3: Canvas Work.</strong> A full floating canvas chest piece is hand-basted into the jacket front, providing structure without stiffness.</p>
<p><strong>Step 4: Assembly.</strong> The jacket is assembled inside-out, allowing the hand-stitched details to remain invisible from the exterior.</p>
<p><strong>Step 5: Finishing.</strong> Buttons are cross-stitched, buttonholes are hand-worked, and the jacket receives a final steam press.</p>`,
      coverImage: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=1200&q=80",
      category: "Craftsmanship",
      tags: JSON.stringify(["craftsmanship", "tailoring", "blazer", "sartorial"]),
      isPublished: true,
      publishedAt: new Date("2026-01-20"),
    },
    {
      title: "The Dark Romance Collection: A Study in Contrast",
      slug: "dark-romance-collection-study-contrast",
      excerpt: "Creative Director Sahin Thapa on the inspiration behind our most dramatic collection yet — where shadow meets sensuality.",
      content: `<h2>The Mood Board</h2>
<p>Dark Romance began with a single image: a black rose against a burgundy velvet backdrop. From there, the collection grew into an exploration of contrast — hard versus soft, light versus shadow, strength versus vulnerability.</p>
<p>The color palette is deliberately restrained: black, burgundy, deep crimson, and charcoal. Within this limited spectrum, texture becomes the primary differentiator — matte jersey against liquid satin, structured crepe against fluid georgette.</p>
<h2>Key Pieces</h2>
<p>The collection centers on three statement pieces: the Midnight Fall Gown, which captures light like water; the Draped One-Shoulder Gown, a study in asymmetric balance; and the Command Bodycon in burgundy, which proved so popular it has been carried into our Signature collection.</p>
<blockquote>"Dark Romance is about the power of restraint. The most dramatic effect comes from what you leave out, not what you add."</blockquote>
<p>The collection debuted at an intimate presentation in Kathmandu, with the Nepali landscape providing a dramatic backdrop to the architectural silhouettes.</p>`,
      coverImage: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&q=80",
      category: "Collections",
      tags: JSON.stringify(["dark-romance", "collection", "design", "editorial"]),
      isPublished: true,
      publishedAt: new Date("2026-02-14"),
    },
    {
      title: "Sustainable Luxury: Our Commitment",
      slug: "sustainable-luxury-commitment",
      excerpt: "How PEA_FITS is redefining luxury fashion through ethical sourcing, responsible production, and enduring design.",
      content: `<h2>Luxury That Lasts</h2>
<p>True luxury is not measured by price tag alone — it is measured by longevity. A PEA_FITS garment is designed to be worn for years, not seasons. This philosophy inherently reduces waste: the most sustainable garment is the one already in your closet.</p>
<h2>Our Practices</h2>
<p><strong>Ethical Sourcing.</strong> All our fabrics are sourced from mills that meet strict environmental and labor standards. Our Italian wool mills use renewable energy, and our Japanese fabric suppliers are certified for water conservation.</p>
<p><strong>Responsible Production.</strong> We produce in small, deliberate batches — never more than 50 units per style per color. This minimizes overproduction and ensures every piece receives the attention it deserves.</p>
<p><strong>Enduring Design.</strong> We do not follow trends. Our silhouettes are designed to transcend seasons, making them relevant year after year.</p>
<h2>Our Promise</h2>
<p>We are committed to reducing our environmental footprint. By 2027, we aim to transition 70% of our collection to sustainably sourced materials without compromising on the quality and hand-feel our clients expect.</p>`,
      coverImage: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=1200&q=80",
      category: "Sustainability",
      tags: JSON.stringify(["sustainability", "ethical", "luxury", "environment"]),
      isPublished: true,
      publishedAt: new Date("2026-03-08"),
    },
  ];

  for (const post of journalPosts) {
    await prisma.journalArticle.create({ data: post });
  }
  console.log("  ✓ Created journal posts");

  // ── Site Settings ──
  await prisma.siteSettings.create({
    data: {
      siteName: "PEA_FITS",
      tagline: "Architectural Silhouettes",
      email: "hello@peafits.com",
      phone: "+977-1-4XXXXXX",
      address: "Durbar Marg, Kathmandu, Nepal",
      socialLinks: JSON.stringify({
        instagram: "https://instagram.com/pea_fits",
        facebook: "https://facebook.com/peafits",
        tiktok: "https://tiktok.com/@peafits",
      }),
      shippingConfig: JSON.stringify({
        domestic: [
          { name: "Standard", cost: 250, minDays: 3, maxDays: 5 },
          { name: "Express", cost: 600, minDays: 1, maxDays: 2 },
        ],
        freeShippingThreshold: 15000,
      }),
      seoDefaults: JSON.stringify({
        title: "PEA_FITS — Architectural Silhouettes",
        description: "Architectural silhouettes and effortless luxury for the modern woman. Discover curated collections from Nepal.",
      }),
    },
  });
  console.log("  ✓ Created site settings");

  // ── Brand Book Sections ──
  const brandBookSections = [
    {
      title: "Brand Identity",
      slug: "brand-identity",
      content: `<h2>Core Identity</h2><p>PEA_FITS is an architectural fashion house based in Kathmandu, Nepal, creating silhouettes that empower the modern woman. Our aesthetic is defined by clean lines, structural precision, and understated luxury.</p><h3>Brand Values</h3><ul><li><strong>Architectural Precision:</strong> Every garment is constructed with mathematical attention to line, proportion, and volume.</li><li><strong>Effortless Luxury:</strong> Understated opulence that speaks through quality and cut rather than logos or branding.</li><li><strong>Timeless Design:</strong> Silhouettes that transcend trends — designed to be worn for years.</li><li><strong>Nepali Heritage:</strong> Proudly based in Kathmandu, drawing inspiration from the Himalayan aesthetic of clean lines and natural materials.</li></ul>`,
      sortOrder: 1,
    },
    {
      title: "Visual Language",
      slug: "visual-language",
      content: `<h2>Color Palette</h2><p>Primary: Black (#000000), White (#FFFFFF), Neutral tones. Accent: Burgundy (#800020), Editorial Red (#AE0200). Background: Bone (#FBFBFB), Surface (#FFFFFF).</p><h2>Typography</h2><p>Display/Headings: EB Garamond (Serif) — for editorial elegance. Body/UI: Hanken Grotesk (Sans-serif) — for modern clarity.</p>`,
      sortOrder: 2,
    },
    {
      title: "Voice & Tone",
      slug: "voice-tone",
      content: `<h2>Brand Voice</h2><p>Confident, refined, editorial. We speak to the woman who knows what she wants and doesn't need validation. Our tone is warm but not familiar, aspirational but not exclusive.</p><h2>Guidelines</h2><ul><li>Use "architectural" and "silhouette" as signature descriptors</li><li>Reference Nepal and Kathmandu as design origins, not exoticism</li><li>Focus on craftsmanship, quality, and design philosophy</li><li>Never use discounts or sales language — we speak in value, not price</li></ul>`,
      sortOrder: 3,
    },
  ];

  for (const section of brandBookSections) {
    await prisma.brandBookSection.create({ data: section });
  }
  console.log("  ✓ Created brand book sections");

  // ── Sample Contact Message ──
  await prisma.contactMessage.create({
    data: {
      name: "Priya Shrestha",
      email: "priya@example.com",
      subject: "Inquiry about custom sizing",
      message: "Hello, I'm interested in the Draped Halter Gown but would need a custom length. Is this possible?",
      isRead: false,
    },
  });
  console.log("  ✓ Created sample contact message");

  // ── Sample Newsletter Subscriber ──
  await prisma.newsletterSubscriber.create({
    data: {
      email: "subscriber@example.com",
      isActive: true,
    },
  });
  console.log("  ✓ Created sample newsletter subscriber");

  console.log("\n═══════════════════════════════════════");
  console.log("  🌱  SEED COMPLETE");
  console.log("═══════════════════════════════════════");
  console.log(`  Users:         7 (1 admin, 1 customer, 5 reviewers)`);
  console.log(`  Categories:    6`);
  console.log(`  Collections:   5`);
  console.log(`  Products:      9 (with variants & images)`);
  console.log(`  Reviews:       45`);
  console.log(`  Journal Posts: 4`);
  console.log(`  Brand Book:    3`);
  console.log("───────────────────────────────────────");
  console.log("  Admin:    admin@peafits.com / Admin@123");
  console.log("  Customer: customer@example.com / Customer@123");
  console.log("═══════════════════════════════════════\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });