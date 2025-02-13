import { validateTool, ValidationErrorCode, ValidationWarningCode } from '../index';
import { ModernTool, Duration, SideEffect } from '../../index';

describe('Tool Validator', () => {
  const validTool: ModernTool = {
    version: '1.0.0',
    documentation: {
      description: 'A comprehensive tool for testing the validation system',
      examples: [{
        input: { test: true },
        output: { result: true },
        description: 'Basic test'
      }],
      limitations: ['Test limitation'],
      costImplications: {
        estimatedCostPerCall: 0.1,
        currency: 'USD',
        billingModel: 'per-call'
      }
    },
    errors: {
      possibleErrors: [{
        code: 'TEST_ERROR',
        description: 'Test error',
        isRetryable: true,
        suggestedUserMessage: 'Test message'
      }],
      retryStrategies: [{
        type: 'exponential-backoff',
        maxAttempts: 3
      }]
    },
    execution: {
      estimatedDuration: {
        min: 1,
        max: 10,
        unit: 'ms' as const  // Fixed: Using proper time unit type
      },
      canBeCancelled: true,
      supportsProgress: true
    },
    state: {
      persistsBetweenCalls: true,
      requiredContext: [{
        key: 'test',
        type: 'system',
        description: 'Test context'
      }],
      sideEffects: [{
        type: 'filesystem' as const,  // Fixed: Using proper side effect type
        description: 'Test effect',
        isReversible: true
      }]
    }
  };

  describe('Basic Validation', () => {
    it('should pass for a valid tool', () => {
      const result = validateTool(validTool);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail for missing required fields', () => {
      const invalidTool = {
        version: '1.0.0'
      } as ModernTool;

      const result = validateTool(invalidTool);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: ValidationErrorCode.MISSING_REQUIRED,
          path: ['documentation']
        })
      );
    });
  });

  describe('Documentation Validation', () => {
    it('should warn about short descriptions', () => {
      const tool = {
        ...validTool,
        documentation: {
          ...validTool.documentation,
          description: 'Too short'
        }
      };

      const result = validateTool(tool);
      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          code: ValidationWarningCode.BEST_PRACTICE,
          path: ['documentation', 'description']
        })
      );
    });

    it('should warn about missing examples', () => {
      const tool = {
        ...validTool,
        documentation: {
          ...validTool.documentation,
          examples: []
        }
      };

      const result = validateTool(tool);
      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          code: ValidationWarningCode.MISSING_RECOMMENDED,
          path: ['documentation', 'examples']
        })
      );
    });
  });

  describe('Error Handling Validation', () => {
    it('should require retry strategies for retryable errors', () => {
      const tool = {
        ...validTool,
        errors: {
          possibleErrors: [{
            code: 'TEST',
            description: 'Test',
            isRetryable: true,
            suggestedUserMessage: 'Test'
          }],
          retryStrategies: []
        }
      };

      const result = validateTool(tool);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: ValidationErrorCode.INCONSISTENT_STATE,
          path: ['errors', 'retryStrategies']
        })
      );
    });

    it('should validate error types', () => {
      const tool = {
        ...validTool,
        errors: {
          possibleErrors: [{
            code: 'TEST',
            description: 'Test',
            isRetryable: 'maybe' as any, // Invalid type
            suggestedUserMessage: 'Test'
          }],
          retryStrategies: []
        }
      };

      const result = validateTool(tool);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: ValidationErrorCode.INVALID_TYPE,
          path: ['errors', 'possibleErrors', '0', 'isRetryable']
        })
      );
    });
  });

  describe('Execution Validation', () => {
    it('should validate duration ranges', () => {
      const tool = {
        ...validTool,
        execution: {
          ...validTool.execution,
          estimatedDuration: {
            min: 10,
            max: 5,
            unit: 'ms' as const  // Fixed: Using proper time unit type
          }
        }
      };

      const result = validateTool(tool);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: ValidationErrorCode.INVALID_VALUE,
          path: ['execution', 'estimatedDuration']
        })
      );
    });

    it('should validate parallel execution limits', () => {
      const tool = {
        ...validTool,
        execution: {
          ...validTool.execution,
          parallelExecutionLimit: -1
        }
      };

      const result = validateTool(tool);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: ValidationErrorCode.INVALID_VALUE,
          path: ['execution', 'parallelExecutionLimit']
        })
      );
    });
  });

  describe('State Validation', () => {
    it('should warn about missing context for persistent state', () => {
      const tool = {
        ...validTool,
        state: {
          ...validTool.state,
          persistsBetweenCalls: true,
          requiredContext: []
        }
      };

      const result = validateTool(tool);
      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          code: ValidationWarningCode.BEST_PRACTICE,
          path: ['state', 'requiredContext']
        })
      );
    });

    it('should validate side effects', () => {
      const tool = {
        ...validTool,
        state: {
          ...validTool.state,
          sideEffects: [{
            type: 'filesystem' as const,  // Fixed: Using proper side effect type
            description: '', // Empty description
            isReversible: true
          }]
        }
      };

      const result = validateTool(tool);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: ValidationErrorCode.MISSING_REQUIRED,
          path: ['state', 'sideEffects', '0', 'description']
        })
      );
    });
  });
});
