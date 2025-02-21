import { type SchemaTypeDefinition } from "sanity";
import { promotionCode } from "./schemas/promotion-codes";
import { promotionCampaign } from "./schemas/promotion-campaign";
import { product } from "./schemas/product";
import { productCategory } from "./schemas/product-category";
import { order, orderItem, shippingAddress } from "./schemas/order";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    promotionCode,
    promotionCampaign,
    product,
    productCategory,
    shippingAddress,
    orderItem,
    order,
  ],
};
