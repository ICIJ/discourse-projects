# frozen_string_literal: true

require "rails_helper"

RSpec.describe Projects do
  before { SiteSetting.projects_enabled = true }
end