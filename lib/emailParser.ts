interface EmailContent {
    subject: string;
    body: string;
    from: string;
    messageId: string;
  }
  
  interface ContractUpdateCommand {
    action: 'EXTEND_CONTRACT' | 'UPDATE_AMOUNT' | 'CHANGE_DETAILS';
    contractId: number;
    newValue?: string;
    authorizationCode: string;
  }
  
  export function parseEmailForCommands(email: EmailContent): ContractUpdateCommand | null {
    const commandRegex = /%%CONTRACT_CMD:(.+?)%%/gs;
    const matches = [...email.body.matchAll(commandRegex)];
    
    if (!matches.length) return null;
  
    try {
      const command = JSON.parse(matches[0][1]) as ContractUpdateCommand;
      
      // Validate command structure
      if (!command.action || !command.contractId || !command.authorizationCode) {
        throw new Error('Invalid command format');
      }
      
      return command;
    } catch (error) {
      console.error('Error parsing email command:', error);
      return null;
    }
  }