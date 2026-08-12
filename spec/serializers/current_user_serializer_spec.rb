# frozen_string_literal: true

RSpec.describe CurrentUserSerializer do
  before do
    SiteSetting.projects_enabled = true
    # These examples assert core's guardian answer. discourse-datashare, when
    # co-installed, grants category creation to everyone by default, so drop it
    # back to no groups to keep the outcome the same as a standalone install.
    if SiteSetting.respond_to?(:datashare_create_category_groups)
      SiteSetting.datashare_create_category_groups = ""
    end
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

      describe "with moderator not managing categories" do

        before do
          SiteSetting.moderators_manage_categories = false
        end

        it "returns false" do
          expect(serializer.can_create_category).to be_falsy
        end
      end

      describe "with moderator managing categories" do

        before do
          SiteSetting.moderators_manage_categories = true
        end

        it "returns true" do
          expect(serializer.can_create_category).to be_truthy
        end
      end
    end
  end
end
