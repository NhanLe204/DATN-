import rateModel from '../models/rate.model.js';
export const createOrderAfterPayment = async (req, res) => {
    try {
        const { orderDetailID, score } = req.body;
        console.log(orderDetailID, score);
        const newRating = await rateModel.create({ orderDetailID, score });
        res.status(201).json(newRating);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ error: 'Failed to create rating', details: errorMessage });
    }
};
//# sourceMappingURL=order.controllers.js.map