// Refactored Portfolio Form with clean architecture
import React from "react";
import { createValidationService } from "../../services";
import { useCentralizedStateContext } from "../../store";
import { Button, Card, StatusIndicator } from "../ui";
import { PortfolioSetupSectionV2 } from "./PortfolioSetupSectionV2";

export const PortfolioFormV2: React.FC = () => {
  const { formData, resetForm, selectors } = useCentralizedStateContext();

  // Business logic service
  const validationService = createValidationService();

  // Overall form validation
  const formValidation = validationService.validateFormData(formData);
  const hasWarnings = Object.keys(formValidation.warnings).length > 0;

  return (
    <Card title="Portfolio Configuration" className="mb-4">
      {/* Form Validation Status */}
      {!formValidation.isValid && (
        <StatusIndicator
          status="error"
          message="Please fix the following errors:"
          details={Object.values(formValidation.errors).join(", ")}
          className="mb-4"
        />
      )}

      {hasWarnings && (
        <StatusIndicator
          status="warning"
          message="Please review the following warnings:"
          details={Object.values(formValidation.warnings).join(", ")}
          className="mb-4"
        />
      )}

      {/* Section 1: Portfolio Setup */}
      <PortfolioSetupSectionV2 />

      {/* TODO: Add other sections here */}
      {/* Section 2: Economic Scenarios */}
      {/* Section 3: Market Assumptions */}
      {/* Section 4: Leverage Configuration */}
      {/* Section 5: Income & Cashflow */}

      {/* Form Actions */}
      <div className="flex justify-end mt-6">
        <Button onClick={resetForm} variant="secondary" icon="🔄">
          Reset to Defaults
        </Button>
      </div>
    </Card>
  );
};
