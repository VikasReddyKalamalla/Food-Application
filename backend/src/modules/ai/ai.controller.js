import aiService from './ai.service.js';
import { sendSuccess } from '../../common/utils/response.util.js';
import { HTTP_STATUS } from '../../common/constants/http-status.js';

export class AIController {
  search = async (req, res) => {
    const result = await aiService.searchFood(req.body.query);
    return sendSuccess(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'AI food search executed successfully',
      data: result,
    });
  };

  recommendations = async (req, res) => {
    const result = await aiService.getRecommendations(req.body);
    return sendSuccess(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Recommendations generated successfully',
      data: result,
    });
  };

  chat = async (req, res) => {
    const result = await aiService.chatWithAssistant(req.body.messages);
    return sendSuccess(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'AI assistant reply generated',
      data: result,
    });
  };

  faq = async (req, res) => {
    const result = await aiService.getFaq(req.body.question);
    return sendSuccess(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'FAQ answered successfully',
      data: result,
    });
  };

  insights = async (req, res) => {
    const result = await aiService.getInsights(req.params.restaurantId);
    return sendSuccess(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Business insights generated',
      data: result,
    });
  };
}

export const aiController = new AIController();
export default aiController;
