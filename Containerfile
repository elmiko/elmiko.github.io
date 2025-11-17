FROM ruby:3.3

RUN gem update bundler

RUN gem install bundler jekyll

WORKDIR /opt/site

ADD . /opt/site/

RUN bundle install

EXPOSE 4000

CMD bundle exec jekyll serve -H 0.0.0.0
