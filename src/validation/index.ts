import { ModernTool, ErrorType, RetryStrategy, Documentation } from '../index';

export type ValidationResult = {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
};

export type ValidationError = {
  path: string[];
  message: string;
  code: ValidationErrorCode;
};

export type ValidationWarning = {
  path: string[];
  message: string;
  code: ValidationWarningCode;
};

export enum ValidationErrorCode {
  MISSING_REQUIRED = 'MISSING_REQUIRED',
  INVALID_TYPE = 'INVALID_TYPE',
  INVALID_VALUE = 'INVALID_VALUE',
  INCONSISTENT_STATE = 'INCONSISTENT_STATE'
}

export enum ValidationWarningCode {
  MISSING_RECOMMENDED = 'MISSING_RECOMMENDED',
  POTENTIAL_ISSUE = 'POTENTIAL_ISSUE',
  BEST_PRACTICE = 'BEST_PRACTICE'
}

export class ToolValidator {
  private errors: ValidationError[] = [];
  private warnings: ValidationWarning[] = [];

  validate(tool: ModernTool): ValidationResult {
    this.errors = [];
    this.warnings = [];

    // Basic required fields
    this.validateRequired(tool);
    
    // Documentation
    if (tool.documentation) {
      this.validateDocumentation(tool.documentation);
    }

    // Error handling
    if (tool.errors) {
      this.validateErrorHandling(tool.errors);
    }

    // Execution config
    if (tool.execution) {
      this.validateExecution(tool.execution);
    }

    // State management
    if (tool.state) {
      this.validateState(tool.state);
    }

    return {
      isValid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings
    };
  }

  private validateRequired(tool: ModernTool) {
    if (!tool.version) {
      this.addError(['version'], 'Version is required', ValidationErrorCode.MISSING_REQUIRED);
    }

    if (!tool.documentation) {
      this.addError(['documentation'], 'Documentation is required', ValidationErrorCode.MISSING_REQUIRED);
    }

    if (!tool.errors) {
      this.addError(['errors'], 'Error configuration is required', ValidationErrorCode.MISSING_REQUIRED);
    }

    if (!tool.execution) {
      this.addError(['execution'], 'Execution configuration is required', ValidationErrorCode.MISSING_REQUIRED);
    }
  }

  private validateDocumentation(docs: Documentation) {
    if (!docs.description) {
      this.addError(
        ['documentation', 'description'],
        'Description is required',
        ValidationErrorCode.MISSING_REQUIRED
      );
    } else if (docs.description.length < 50) {
      this.addWarning(
        ['documentation', 'description'],
        'Description should be detailed (50+ characters)',
        ValidationWarningCode.BEST_PRACTICE
      );
    }

    if (!docs.examples || docs.examples.length === 0) {
      this.addWarning(
        ['documentation', 'examples'],
        'Examples are recommended',
        ValidationWarningCode.MISSING_RECOMMENDED
      );
    }

    if (!docs.limitations || docs.limitations.length === 0) {
      this.addWarning(
        ['documentation', 'limitations'],
        'Documenting limitations is recommended',
        ValidationWarningCode.MISSING_RECOMMENDED
      );
    }

    // Cost implications
    if (docs.costImplications) {
      if (typeof docs.costImplications.estimatedCostPerCall !== 'number') {
        this.addError(
          ['documentation', 'costImplications', 'estimatedCostPerCall'],
          'Cost per call must be a number',
          ValidationErrorCode.INVALID_TYPE
        );
      }
    } else {
      this.addWarning(
        ['documentation', 'costImplications'],
        'Cost implications are recommended',
        ValidationWarningCode.MISSING_RECOMMENDED
      );
    }
  }

  private validateErrorHandling(errorConfig: { possibleErrors: ErrorType[]; retryStrategies: RetryStrategy[] }) {
    if (!errorConfig.possibleErrors || errorConfig.possibleErrors.length === 0) {
      this.addError(
        ['errors', 'possibleErrors'],
        'At least one possible error must be defined',
        ValidationErrorCode.MISSING_REQUIRED
      );
    }

    errorConfig.possibleErrors?.forEach((error, index) => {
      if (!error.code) {
        this.addError(
          ['errors', 'possibleErrors', index.toString(), 'code'],
          'Error code is required',
          ValidationErrorCode.MISSING_REQUIRED
        );
      }

      if (!error.description) {
        this.addError(
          ['errors', 'possibleErrors', index.toString(), 'description'],
          'Error description is required',
          ValidationErrorCode.MISSING_REQUIRED
        );
      }

      if (typeof error.isRetryable !== 'boolean') {
        this.addError(
          ['errors', 'possibleErrors', index.toString(), 'isRetryable'],
          'isRetryable must be a boolean',
          ValidationErrorCode.INVALID_TYPE
        );
      }

      if (!error.suggestedUserMessage) {
        this.addWarning(
          ['errors', 'possibleErrors', index.toString(), 'suggestedUserMessage'],
          'User message is recommended',
          ValidationWarningCode.MISSING_RECOMMENDED
        );
      }
    });

    // Validate retry strategies
    if (errorConfig.possibleErrors?.some(e => e.isRetryable) && (!errorConfig.retryStrategies || errorConfig.retryStrategies.length === 0)) {
      this.addError(
        ['errors', 'retryStrategies'],
        'Retry strategies required when retryable errors exist',
        ValidationErrorCode.INCONSISTENT_STATE
      );
    }
  }

  private validateExecution(execution: ModernTool['execution']) {
    if (typeof execution.canBeCancelled !== 'boolean') {
      this.addError(
        ['execution', 'canBeCancelled'],
        'canBeCancelled must be a boolean',
        ValidationErrorCode.INVALID_TYPE
      );
    }

    if (typeof execution.supportsProgress !== 'boolean') {
      this.addError(
        ['execution', 'supportsProgress'],
        'supportsProgress must be a boolean',
        ValidationErrorCode.INVALID_TYPE
      );
    }

    if (execution.estimatedDuration) {
      if (execution.estimatedDuration.min >= execution.estimatedDuration.max) {
        this.addError(
          ['execution', 'estimatedDuration'],
          'Duration min must be less than max',
          ValidationErrorCode.INVALID_VALUE
        );
      }
    }

    if (execution.parallelExecutionLimit !== undefined && execution.parallelExecutionLimit <= 0) {
      this.addError(
        ['execution', 'parallelExecutionLimit'],
        'Parallel execution limit must be positive',
        ValidationErrorCode.INVALID_VALUE
      );
    }
  }

  private validateState(state: ModernTool['state']) {
    if (typeof state.persistsBetweenCalls !== 'boolean') {
      this.addError(
        ['state', 'persistsBetweenCalls'],
        'persistsBetweenCalls must be a boolean',
        ValidationErrorCode.INVALID_TYPE
      );
    }

    // If state persists, we should have some context
    if (state.persistsBetweenCalls && (!state.requiredContext || state.requiredContext.length === 0)) {
      this.addWarning(
        ['state', 'requiredContext'],
        'Persisting state should specify required context',
        ValidationWarningCode.BEST_PRACTICE
      );
    }

    // Validate side effects
    state.sideEffects?.forEach((effect, index) => {
      if (!effect.description) {
        this.addError(
          ['state', 'sideEffects', index.toString(), 'description'],
          'Side effect description is required',
          ValidationErrorCode.MISSING_REQUIRED
        );
      }

      if (typeof effect.isReversible !== 'boolean') {
        this.addError(
          ['state', 'sideEffects', index.toString(), 'isReversible'],
          'isReversible must be a boolean',
          ValidationErrorCode.INVALID_TYPE
        );
      }
    });
  }

  private addError(path: string[], message: string, code: ValidationErrorCode) {
    this.errors.push({ path, message, code });
  }

  private addWarning(path: string[], message: string, code: ValidationWarningCode) {
    this.warnings.push({ path, message, code });
  }
}

// Helper function to validate a tool
export function validateTool(tool: ModernTool): ValidationResult {
  const validator = new ToolValidator();
  return validator.validate(tool);
}

// Example usage:
// const result = validateTool(myTool);
// if (!result.isValid) {
//   console.error('Tool validation failed:', result.errors);
//   console.warn('Warnings:', result.warnings);
// }
