# frozen_string_literal: true

require "rails_helper"

RSpec.describe Category do
  describe "#project?" do
    
    context "when category has no parent and has read restriction" do
      subject(:category) { Fabricate.build(:category, read_restricted: true, parent_category: nil) }

      it "returns true" do
        expect(category.project?).to be_truthy
      end
    end

    context "when category has no parent and but has no read restriction" do
      subject(:category) { Fabricate.build(:category, read_restricted: false, parent_category: nil) }

      it "returns false" do
        expect(category.project?).to be_falsy
      end
    end
  end
end
