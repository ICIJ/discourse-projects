# frozen_string_literal: true

RSpec.describe BasicCategorySerializer do
  before do
    SiteSetting.projects_enabled = true
  end
  
  describe "when category has no parent and has read restriction" do
    fab!(:category) { Fabricate(:category, read_restricted: true, parent_category: nil) }

    let(:serializer) do
      described_class.new(category, scope: Guardian.new(category), root: false)
    end

    describe '#is_project' do
      it "returns true" do
        expect(serializer.is_project).to be_truthy
      end
    end

    describe '#project' do 
      it "returns nil" do
        expect(serializer.project).to be_nil
      end
    end
  end

  describe "when category has a parent that is a project" do
    fab!(:parent_category) { Fabricate(:category, read_restricted: true, parent_category: nil) }
    fab!(:category) { Fabricate(:category, parent_category:) }

    let(:serializer) do
      described_class.new(category, scope: Guardian.new(category), root: false)
    end

    describe '#is_project' do
      it "returns false" do
        expect(serializer.is_project).to be_falsy
      end
    end

    describe '#project' do 
      it "returns a project that is not nil" do
        expect(serializer.project).not_to be_nil
      end

      it "has an id matching the parent category" do
        expect(serializer.project["id"]).to eq(parent_category.id)
      end
    end
  end
end