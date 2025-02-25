// Import necessary dependencies
import { RuleEngine, Operator } from "../src/RuleEngine.js";

describe('Rule Engine', () => {
  let ruleEngine;
  let mockConsoleError;
  const functions = {
    beforeFunction: jest.fn(() => ({ factValue: 10 })),
    afterFunction: jest.fn(),
    functionWithError: jest.fn(() => { throw new Error("Error in function") })
  };  

  beforeAll(() => {
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation();
  });
  
  beforeEach(() => {
    ruleEngine = new RuleEngine(functions);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });


  it('adds rules correctly', () => {
    const rule = { before: 'beforeFunction', conditions: { and: [] }, after: 'afterFunction' };
    ruleEngine.addRule(rule);
    expect(ruleEngine.rules).toContain(rule);
  });

  it('executes the before and after functions if conditions are met', async () => {
    const rule = {
      before: {func : 'beforeFunction'},
      conditions: { and: [{ fact: 'factValue', operator: Operator.GREATER_THAN_OR_EQUAL, value: 10 }] },
      after: {func : 'afterFunction'},
    };
    ruleEngine.addRule(rule);
    await ruleEngine.obey();
    expect(functions.beforeFunction).toHaveBeenCalled();
    expect(functions.afterFunction).toHaveBeenCalled();
  });

  it('does not execute the after function if conditions are not met', async () => {
    const rule = {
      before: {func : 'beforeFunction'},
      conditions: { and: [{ fact: 'factValue', operator: Operator.LESS_THAN, value: 10 }] },
      after: {func : 'afterFunction'},
    };
    ruleEngine.addRule(rule);
    await ruleEngine.obey();
    expect(functions.beforeFunction).toHaveBeenCalled();
    expect(functions.afterFunction).not.toHaveBeenCalled();
  });

  it('handles logical OR conditions correctly', async () => {
    const rule = {
      before: {func : 'beforeFunction'},
      conditions: { or: [{ fact: 'factValue', operator: Operator.STRICT_EQUAL, value: 5 }, { fact: 'factValue', operator: Operator.GREATER_THAN, value: 5 }] },
      after: {func : 'afterFunction'},
    };
    ruleEngine.addRule(rule);
    await ruleEngine.obey();
    expect(functions.afterFunction).toHaveBeenCalled();
  });

  it('reports error when the before function is not found', async () => {
    const rule = {
      before: {func : 'nonExistentFunction'},
      conditions: { and: [{ fact: 'factValue', operator: Operator.STRICT_EQUAL, value: 10 }] },
      after: {func : 'afterFunction'},
    };
    ruleEngine.addRule(rule);
    await ruleEngine.obey();
    expect(mockConsoleError).toHaveBeenCalledWith("Function 'nonExistentFunction' not found or not a function.");
  });

  it('catches and logs errors from the function execution', async () => {
    const rule = {
      before: { func: 'functionWithError' },
      conditions: { and: [{ fact: 'factValue', operator: Operator.STRICT_EQUAL, value: 10 }] },
      after: { func: 'afterFunction' },
    };
    ruleEngine.addRule(rule);
    await ruleEngine.obey();
    expect(mockConsoleError).toHaveBeenCalled();
  });
  
  
  
});
