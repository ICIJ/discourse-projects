

import Component from "@glimmer/component";
export default class ProjectBanner extends Component {
  <template>
      <div class="project-banner__head">
         You're in project <a href="{{@category.url}}" class="project-banner__link">{{@category.name}}</a>
      </div>
      <style>
        .project-banner__head{
            display:block;
            padding: 10px 0px;
            margin:20px 0px;
            background: var(--primary-200);
            text-align: center;
            z-index: 10;
        }
                      
        a.project-banner__link{
          text-decoration:underline;
          text-decoration-color: var(--tertiary); 
          font-weight: bold;
          color:var(--primary);
        
        }
      </style>
  </template>


}