import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseEmailForCommands } from '@/lib/emailParser';
import { verifyWebhookSignature } from '@/lib/emailService';

export async function POST(request: Request) {
  const signature = request.headers.get('x-webhook-signature');
  const body = await request.text();

  // Verify webhook signature
  if (!verifyWebhookSignature(body, signature)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const emailData: EmailContent = JSON.parse(body);

  try {
    // Check if email was already processed
    const existingLog = await prisma.emailProcessingLog.findUnique({
      where: { messageId: emailData.messageId }
    });

    if (existingLog) {
      return NextResponse.json(
        { status: 'already_processed' }
      );
    }

    // Parse email for commands
    await prisma.emailProcessingLog.create({
  data: {
    messageId: emailData.messageId,
    status: processingResult.status,
    action: processingResult.action,
    contractId: command?.contractId // Actually use the command here
  }
});
    void command; // Explicitly mark as used
    let processingResult = { status: 'no_command', action: null };

    if (command) {
      // Validate authorization code
      const validCode = await validateAuthorizationCode(
        command.contractId,
        command.authorizationCode
      );

      if (!validCode) {
        throw new Error('Invalid authorization code');
      }

      // Process command
      processingResult = await processContractCommand(command);
    }

    // Log processing
    await prisma.emailProcessingLog.create({
      data: {
        messageId: emailData.messageId,
        status: processingResult.status,
        action: processingResult.action,
        contractId: command?.contractId
      }
    });

    return NextResponse.json({
      status: 'processed',
      command: processingResult
    });

  } catch (error) {
    console.error('Error processing email:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function processContractCommand(command: ContractUpdateCommand) {
  switch (command.action) {
    case 'EXTEND_CONTRACT':
      return await extendContract(command);
    // Add other cases
    default:
      throw new Error('Unsupported action');
  }
}

async function extendContract(command: ContractUpdateCommand) {
  // Implement contract extension logic
}