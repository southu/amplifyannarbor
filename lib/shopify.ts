const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN!;

interface ShopifyResponse<T> {
  data: T;
  errors?: Array<{ message: string }>;
}

// Using Shopify's tokenless Storefront API access
// Supports: Products, Collections, Cart, Search, Pages/Blogs
// See: https://shopify.dev/docs/api/storefront/latest
async function shopifyFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const url = `https://${SHOPIFY_STORE_DOMAIN}/api/2026-01/graphql.json`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  const json: ShopifyResponse<T> = await response.json();

  if (json.errors) {
    throw new Error(json.errors.map((e) => e.message).join(", "));
  }

  return json.data;
}

export async function getProducts() {
  const query = `
    query GetProducts {
      products(first: 50) {
        edges {
          node {
            id
            title
            handle
            description
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            featuredImage {
              url
              altText
            }
            variants(first: 10) {
              edges {
                node {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  availableForSale
                  selectedOptions {
                    name
                    value
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  interface ProductsResponse {
    products: {
      edges: Array<{
        node: {
          id: string;
          title: string;
          handle: string;
          description: string;
          priceRange: {
            minVariantPrice: {
              amount: string;
              currencyCode: string;
            };
          };
          featuredImage: {
            url: string;
            altText: string | null;
          } | null;
          variants: {
            edges: Array<{
              node: {
                id: string;
                title: string;
                price: {
                  amount: string;
                  currencyCode: string;
                };
                availableForSale: boolean;
                selectedOptions: Array<{
                  name: string;
                  value: string;
                }>;
              };
            }>;
          };
        };
      }>;
    };
  }

  const data = await shopifyFetch<ProductsResponse>(query);
  return data.products.edges.map((edge) => edge.node);
}

export async function getProductByHandle(handle: string) {
  const query = `
    query GetProductByHandle($handle: String!) {
      productByHandle(handle: $handle) {
        id
        title
        handle
        description
        descriptionHtml
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        featuredImage {
          url
          altText
        }
        images(first: 10) {
          edges {
            node {
              url
              altText
            }
          }
        }
        variants(first: 20) {
          edges {
            node {
              id
              title
              price {
                amount
                currencyCode
              }
              availableForSale
              selectedOptions {
                name
                value
              }
            }
          }
        }
        options {
          name
          values
        }
      }
    }
  `;

  interface ProductResponse {
    productByHandle: {
      id: string;
      title: string;
      handle: string;
      description: string;
      descriptionHtml: string;
      priceRange: {
        minVariantPrice: {
          amount: string;
          currencyCode: string;
        };
      };
      featuredImage: {
        url: string;
        altText: string | null;
      } | null;
      images: {
        edges: Array<{
          node: {
            url: string;
            altText: string | null;
          };
        }>;
      };
      variants: {
        edges: Array<{
          node: {
            id: string;
            title: string;
            price: {
              amount: string;
              currencyCode: string;
            };
            availableForSale: boolean;
            selectedOptions: Array<{
              name: string;
              value: string;
            }>;
          };
        }>;
      };
      options: Array<{
        name: string;
        values: string[];
      }>;
    } | null;
  }

  const data = await shopifyFetch<ProductResponse>(query, { handle });
  return data.productByHandle;
}

// Using Cart API (works with tokenless access, replaces deprecated Checkout API)
export async function createCheckout(lineItems: Array<{ variantId: string; quantity: number }>) {
  const query = `
    mutation CartCreate($lines: [CartLineInput!]!) {
      cartCreate(input: { lines: $lines }) {
        cart {
          id
          checkoutUrl
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  // Transform lineItems to Cart API format
  const lines = lineItems.map((item) => ({
    merchandiseId: item.variantId,
    quantity: item.quantity,
  }));

  interface CartResponse {
    cartCreate: {
      cart: {
        id: string;
        checkoutUrl: string;
      } | null;
      userErrors: Array<{ field: string[]; message: string }>;
    };
  }

  const data = await shopifyFetch<CartResponse>(query, { lines });
  
  if (data.cartCreate.userErrors.length > 0) {
    throw new Error(data.cartCreate.userErrors.map((e) => e.message).join(", "));
  }

  // Return in same format as old checkout for compatibility
  return data.cartCreate.cart ? {
    id: data.cartCreate.cart.id,
    webUrl: data.cartCreate.cart.checkoutUrl,
  } : null;
}

