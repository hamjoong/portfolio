/**
 * 블로그 인터랙션 관리 클래스
 */
class BlogManager {
  private readonly $nav = $('nav');
  private readonly $skillBars = $('.skill_bar');
  private readonly $skillFonts = $('.blog_skill_bar_html_font2, .blog_skill_bar_script_font2, .blog_skill_bar_css_font2, .blog_skill_bar_nodejs_font2, .blog_skill_bar_sass_font2, .blog_skill_bar_ajax_font2, .blog_skill_bar_pug_font2, .blog_skill_bar_jquery_font2, .blog_skill_bar_mysql_font2, .blog_skill_bar_typescript_font2, .blog_skill_bar_java_font2, .blog_skill_bar_json_font2');
  private readonly $portImg = $('.blog_portfolio_img, .blog_portfolio_img2, .blog_portfolio_img3, .blog_portfolio_img4, .blog_portfolio_img5, .blog_portfolio_img6, .blog_portfolio_img7, .blog_portfolio_img8');
  private readonly $portContents = $('.blog_portfolio_contents, .blog_portfolio_contents2, .blog_portfolio_contents3, .blog_portfolio_contents4, .blog_portfolio_contents5, .blog_portfolio_contents6, .blog_portfolio_contents7, .blog_portfolio_contents8');
  private readonly $portLink = $('.blog_portfolio_link, .blog_portfolio_link2, .blog_portfolio_link3, .blog_portfolio_link4, .blog_portfolio_link5, .blog_portfolio_link6, .blog_portfolio_link7, .blog_portfolio_link8');
  private readonly $portBtn = $('.blog_portfolio_link_1, .blog_portfolio_link_2, .blog_portfolio_link_3, .blog_portfolio_link_4, .blog_portfolio_link_5, .blog_portfolio_link_6, .blog_portfolio_link_7, .blog_portfolio_link_8');

  constructor() {
    this.initScrollEvents();
    this.initSkillEvents();
    this.initPortfolioEvents();
  }

  private initScrollEvents() {
    const navItems = [
      { selector: '.blog_nav_home', target: '.blog_intro_box', color: 'rgba(135,206,235,0.1)' },
      { selector: '.blog_nav_aboutme', target: '.blog_aboutme_box', color: 'rgba(255,193,69,0.7)' },
      { selector: '.blog_nav_skill', target: '.blog_aboutme_skill_box', color: 'rgba(148,180,255,0.7)' },
      { selector: '.blog_nav_portfolio', target: '.blog_portfolio_box', color: 'rgb(212,184,182,0.7)' }
    ];

    navItems.forEach(item => {
      $(item.selector).on('click', () => {
        const element = document.querySelector(item.target);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          this.$nav.css('background-color', item.color);
        }
      });
    });
  }

  private initSkillEvents() {
    const skills = [
      { img: '.blog_skill_html_img', bar: '.blog_skill_bar_html', font: '.blog_skill_bar_html_font2' },
      { img: '.blog_skill_script_img', bar: '.blog_skill_bar_script', font: '.blog_skill_bar_script_font2' },
      { img: '.blog_skill_css_img', bar: '.blog_skill_bar_css', font: '.blog_skill_bar_css_font2' },
      { img: '.blog_skill_nodejs_img', bar: '.blog_skill_bar_nodejs', font: '.blog_skill_bar_nodejs_font2' },
      { img: '.blog_skill_sass_img', bar: '.blog_skill_bar_sass', font: '.blog_skill_bar_sass_font2' },
      { img: '.blog_skill_ajax_img', bar: '.blog_skill_bar_ajax', font: '.blog_skill_bar_ajax_font2' },
      { img: '.blog_skill_pug_img', bar: '.blog_skill_bar_pug', font: '.blog_skill_bar_pug_font2' },
      { img: '.blog_skill_jquery_img', bar: '.blog_skill_bar_jquery', font: '.blog_skill_bar_jquery_font2' },
      { img: '.blog_skill_mysql_img', bar: '.blog_skill_bar_mysql', font: '.blog_skill_bar_mysql_font2' },
      { img: '.blog_skill_typescript_img', bar: '.blog_skill_bar_typescript', font: '.blog_skill_bar_typescript_font2' },
      { img: '.blog_skill_java_img', bar: '.blog_skill_bar_java', font: '.blog_skill_bar_java_font2' },
      { img: '.blog_skill_json_img', bar: '.blog_skill_bar_json', font: '.blog_skill_bar_json_font2' }
    ];

    skills.forEach(skill => {
      $(skill.img).on('click', () => {
        this.$skillBars.not(skill.bar).hide();
        this.$skillFonts.not(skill.font).hide();
        $(skill.bar).toggle();
        $(skill.font).toggle();
      });
    });
  }

  private initPortfolioEvents() {
    const portfolios = [
      { list: '.portfolio_list2', img: '.blog_portfolio_img', contents: '.blog_portfolio_contents', link: '.blog_portfolio_link', btn: '.blog_portfolio_link_1' },
      { list: '.portfolio_list3', img: '.blog_portfolio_img2', contents: '.blog_portfolio_contents2', link: '.blog_portfolio_link2', btn: '.blog_portfolio_link_2' },
      { list: '.portfolio_list4', img: '.blog_portfolio_img3', contents: '.blog_portfolio_contents3', link: '.blog_portfolio_link3', btn: '.blog_portfolio_link_3' },
      { list: '.portfolio_list5', img: '.blog_portfolio_img4', contents: '.blog_portfolio_contents4', link: '.blog_portfolio_link4', btn: '.blog_portfolio_link_4' },
      { list: '.portfolio_list6', img: '.blog_portfolio_img5', contents: '.blog_portfolio_contents5', link: '.blog_portfolio_link5', btn: '.blog_portfolio_link_5' },
      { list: '.portfolio_list7', img: '.blog_portfolio_img6', contents: '.blog_portfolio_contents6', link: '.blog_portfolio_link6', btn: '.blog_portfolio_link_6' },
      { list: '.portfolio_list8', img: '.blog_portfolio_img7', contents: '.blog_portfolio_contents7', link: '.blog_portfolio_link7', btn: '.blog_portfolio_link_7' },
      { list: '.portfolio_list9', img: '.blog_portfolio_img8', contents: '.blog_portfolio_contents8', link: '.blog_portfolio_link8', btn: '.blog_portfolio_link_8' }
    ];

    portfolios.forEach(port => {
      $(port.list).on('click', () => {
        this.$portImg.not(port.img).hide();
        this.$portContents.not(port.contents).hide();
        this.$portLink.not(port.link).hide();
        this.$portBtn.not(port.btn).hide();
        
        $(port.img).toggle();
        $(port.contents).toggle();
        $(port.link).toggle();
        $(port.btn).toggle();
      });
    });
  }
}

$(() => {
  new BlogManager();
});