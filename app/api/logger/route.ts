import { NextResponse, NextRequest } from 'next/server';
import logger from '../../../lib/docs/logger';

export async function POST(req: NextRequest) {
  try {
    const requestBody = await req.json();

    // Validate the request body
    if (!requestBody || !requestBody.type || !requestBody.message) {
      logger.error('Invalid request body');
      return NextResponse.json({
        status: 400,
        message: 'Invalid request body',
      }, {
        status: 400,
      });
    }

    const { type, message } = requestBody;

    logger.info(`Request body: ${JSON.stringify(requestBody)}`);

    switch (type) {
        case 'info':
            logger.info(message);
            break;
        case 'warn':
            logger.warn(message);
            break;
        case 'error':
            logger.logWithErrorHandling('client: ', message);
            break;
        default:
            logger.debug(`Unhandled log type: ${type}, message: ${message}`);
            break;
    }

    return NextResponse.json({
      message: 'Successfully logged',
    }, {
      status: 201,
    });
  } catch (error) {
    logger.logWithErrorHandling('client: ', error);
    return NextResponse.json({
      status: 500,
      message: 'Server error',
    }, {
      status: 500,
    });
  }
}
