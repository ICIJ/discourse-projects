# frozen_string_literal: true

require "rails_helper"

RSpec.describe Category do
  describe "#project?" do

    describe "with projects_private set to true" do
      before do 
        SiteSetting.projects_private = true
      end
    
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

      context "when category has a parent and read restriction" do
        subject(:category) { Fabricate.build(:category, read_restricted: true, parent_category:) }

        let(:parent_category) { Fabricate.build(:category) }


        it "returns false" do
          expect(category.project?).to be_falsy
        end
      end
    end


    describe "with projects_private set to false" do
      before do
        SiteSetting.projects_private = false
      end

      context "when category has no parent and has read restriction" do
        subject(:category) { Fabricate.build(:category, read_restricted: true, parent_category: nil) }

        it "returns true" do
          expect(category.project?).to be_truthy
        end
      end

      context "when category has no parent and but has no read restriction" do
        subject(:category) { Fabricate.build(:category, read_restricted: false, parent_category: nil) }

        it "returns true" do
          expect(category.project?).to be_truthy
        end
      end
    end
  end

  describe "#must_belong_to_a_project (validation)" do
    let(:message) { I18n.t("discourse_projects.errors.category_requires_parent") }

    context "when projects_category_requires_parent is enabled" do
      before do
        SiteSetting.projects_category_requires_parent = true
        SiteSetting.projects_private = true
      end

      it "rejects a parent-less category that is not a project" do
        category = Fabricate.build(:category, parent_category: nil, read_restricted: false)
        expect(category).not_to be_valid
        expect(category.errors[:base]).to include(message)
      end

      it "allows a parent-less category that is a project" do
        category = Fabricate.build(:category, parent_category: nil, read_restricted: true)
        category.valid?
        expect(category.errors[:base]).not_to include(message)
      end

      it "allows a category that has a parent" do
        parent = Fabricate(:category, read_restricted: true, parent_category: nil)
        category = Fabricate.build(:category, parent_category: parent)
        category.valid?
        expect(category.errors[:base]).not_to include(message)
      end

      it "rejects clearing the parent of an existing subcategory" do
        parent = Fabricate(:category, read_restricted: true, parent_category: nil)
        category = Fabricate(:category, parent_category: parent)
        category.parent_category_id = nil
        category.read_restricted = false
        expect(category).not_to be_valid
        expect(category.errors[:base]).to include(message)
      end
    end

    context "when projects_category_requires_parent is disabled" do
      before do
        SiteSetting.projects_category_requires_parent = false
        SiteSetting.projects_private = true
      end

      it "allows a parent-less non-project category" do
        category = Fabricate.build(:category, parent_category: nil, read_restricted: false)
        category.valid?
        expect(category.errors[:base]).not_to include(message)
      end
    end
  end
end
