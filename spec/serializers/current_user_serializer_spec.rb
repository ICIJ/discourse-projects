# frozen_string_literal: true

RSpec.describe CurrentUserSerializer do
  before do
    SiteSetting.projects_enabled = true
  end
  
  describe "#can_create_category" do

    describe "with non-admin user" do 

      fab!(:current_user) { Fabricate(:user, admin: false) }

      let(:serializer) do
        described_class.new(current_user, scope: Guardian.new(current_user), root: false)
      end

      it "returns false" do
        expect(serializer.can_create_category).to be_falsy
      end
    end
        
    describe "with admin user" do 

      fab!(:current_user) { Fabricate(:user, admin: true) }

      let(:serializer) do
        described_class.new(current_user, scope: Guardian.new(current_user), root: false)
      end

      it "returns false" do
        expect(serializer.can_create_category).to be_truthy
      end
    end

    describe "with moderator user" do 
      fab!(:current_user) { Fabricate(:user, moderator: true) }

      let(:serializer) do
        described_class.new(current_user, scope: Guardian.new(current_user), root: false)
      end

      describe "with moderator not managing categories and groups" do

        before do 
          SiteSetting.moderators_manage_categories_and_groups = false
        end

        it "returns false" do
          expect(serializer.can_create_category).to be_falsy
        end
      end

      describe "with moderator managing categories and groups" do

        before do 
          SiteSetting.moderators_manage_categories_and_groups = true
        end

        it "returns false" do
          expect(serializer.can_create_category).to be_truthy
        end
      end
    end
  end
end
