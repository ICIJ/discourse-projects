# frozen_string_literal: true

# name: icij-discourse-projects-next
# about: A plugin for using groups to separate and organize categories and topics.
# version: 0.0.0
# authors: ICIJ <engineering@icij.org>
# required_version: 3.4.0


after_initialize do
  add_class_method(:Group, :icij_projects) do
    self.where(icij_group: true)
  end
end
