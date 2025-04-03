"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductStatusMapping = exports.ProductStatus = void 0;
var ProductStatus;
(function (ProductStatus) {
    ProductStatus["AVAILABLE"] = "available";
    ProductStatus["OUT_OF_STOCK"] = "out_of_stock";
    ProductStatus["DISCONTINUED"] = "discontinued";
    // COMING_SOON = 'coming_soon'
})(ProductStatus || (exports.ProductStatus = ProductStatus = {}));
exports.ProductStatusMapping = {
    AVAILABLE: ProductStatus.AVAILABLE,
    OUT_OF_STOCK: ProductStatus.OUT_OF_STOCK,
    DISCONTINUED: ProductStatus.DISCONTINUED
    // COMING_SOON: ProductStatus.COMING_SOON
};
//# sourceMappingURL=product.enum.js.map