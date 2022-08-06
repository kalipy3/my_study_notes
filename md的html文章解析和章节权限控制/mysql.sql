create table article_menu(
    id int auto_increment,
    data text not null,
    article_id int not null,
    primary key(id)
) engine=innoDB default charset=utf8;

#insert into article_menu (data, ariticle_id) VALUES ('[{"label":"一级 1","url":"/a","permission":"admin","content":"<li>test</li>","children":[{"label":"二级 1-1","url":"/b","children":[{"url":"/c","label":"三级 1-1-1"}]}]},{"label":"一级 2","url":"/d","children":[{"url":"/e","label":"二级 2-1","children":[{"url":"/f","label":"三级 2-1-1"}]},{"label":"二级 2-2","url":"/g","children":[{"url":"/h","label":"三级 2-2-1"}]}]},{"url":"/i","label":"一级 3","children":[{"url":"/j","label":"二级 3-1","children":[{"url":"/k","label":"三级 3-1-1"}]},{"url":"/l","label":"二级 3-2","children":[{"url":"/m","label":"三级 3-2-1"}]}]}]', 1);


create table article(
    article_id int auto_increment,
    title varchar(32) not null,
    primary key(article_id)
) engine=innoDB default charset=utf8;

#insert into article (title) VALUES ('mysql入门');


create table article_chapter(
    id int auto_increment,
    chapter_id int not null,
    content longtext not null,
    permission int not null,
    article_id int not null,
    primary key(id)
) engine=innoDB default charset=utf8;

#insert into article_chapter (content, permission, article_id) VALUES ('', 'admin', 1), ('', 'visitor', 1);
















