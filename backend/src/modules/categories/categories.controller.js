import categoriesService from './categories.service.js';
import { sendSuccess } from '../../common/utils/response.util.js';
import { HTTP_STATUS } from '../../common/constants/http-status.js';

export class CategoriesController {
  list = async (req, res) => {
    const categories = await categoriesService.listCategories();
    return sendSuccess(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Categories retrieved successfully',
      data: { categories },
    });
  };

  create = async (req, res) => {
    const category = await categoriesService.createCategory(req.body);
    return sendSuccess(res, {
      statusCode: HTTP_STATUS.CREATED,
      message: 'Category created successfully',
      data: { category },
    });
  };
}

export const categoriesController = new CategoriesController();
export default categoriesController;
