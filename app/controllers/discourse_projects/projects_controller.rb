# frozen_string_literal: true

module ::DiscourseProjects
  class ProjectsController < ::ApplicationController
    requires_plugin DiscourseProjects::PLUGIN_NAME

    def index
      discourse_expires_in 1.minute

      render_serialized(projects, DiscourseProjects::ProjectSerializer, root: "projects")
    end

    def show
      discourse_expires_in 1.minute

      render_serialized(find_project(:slug), DiscourseProjects::ProjectSerializer, root: "project")
    end

    MEMBERS_MAX_PAGE_SIZE = 1_000
    MEMBERS_DEFAULT_PAGE_SIZE = 50

    def members
      discourse_expires_in 1.minute
      
      project = find_project(:slug)
      # Get all group IDs associated with the project
      groups_ids = project.groups.select :id
      # Get all user IDs belonging to those groups
      groups_users = GroupUser.select(:user_id).where(group_id: groups_ids)
      # Fetch human users who are members of the project's groups
      members = User.human_users.where(id: groups_users)
      
      # Apply filtering based on username or email if provided
      if (filter = params[:filter]).present?
        # Support multiple filters separated by commas
        filter = filter.split(",") if filter.include?(",")
        # Only admins can filter by email
        if current_user&.admin
          members = members.filter_by_username_or_email(filter)
        else
          members = members.filter_by_username(filter)
        end
      end
      
      # Determine sort direction for usernames
      dir = params[:asc] && params[:asc].present? ? "ASC" : "DESC"
      # Fetch pagination parameters
      limit = fetch_limit_from_params(default: MEMBERS_DEFAULT_PAGE_SIZE, max: MEMBERS_MAX_PAGE_SIZE)
      offset = params[:offset].to_i
      
      # Validate offset parameter
      raise Discourse::InvalidParameters.new(:offset) if offset < 0

      # Paginate and sort members, including related data
      slice = members
        # Join with group_users to get the added_at timestamp
        .joins(:group_users)
        .select('users.*, MIN(group_users.created_at) AS added_at')
        .where(group_users: { group_id: groups_ids })
        .group('users.id')
        .order(username_lower: dir)
        .offset(offset)
        .limit(limit)

      # Render members and pagination metadata as JSON
      render json: {
        members: serialize_data(slice, GroupUserSerializer),
        meta: {
          total: members.count,
          limit: limit,
          offset: offset,
        },
      }
    end

    private

    def find_project(param_name, ensure_can_see: true)
      slug = params.require(param_name)
      project = projects.find_by("LOWER(slug) = ?", slug.downcase)

      raise Discourse::NotFound if ensure_can_see && !guardian.can_see_category?(project)
      project
    end


    def projects
      Category.secured(guardian).projects.order(name: :asc)
    end
  end
end