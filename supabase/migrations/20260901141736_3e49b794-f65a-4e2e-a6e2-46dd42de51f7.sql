select cron.schedule(
  'render-stories-daily',
  '20 21 * * *',
  $$
  select net.http_post(
    url:='https://project--784450e4-7580-4233-a756-96940d87fc5b.lovable.app/api/public/render-stories',
    headers:='{"Content-Type": "application/json", "x-horoscope-cron-secret": "94c4f3fc2aff347d41b3536ea79eb1b913d59dde1e29caa4bc453079f4304237"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);

select cron.schedule(
  'publish-instagram-daily',
  '35 21 * * *',
  $$
  select net.http_post(
    url:='https://project--784450e4-7580-4233-a756-96940d87fc5b.lovable.app/api/public/publish-instagram',
    headers:='{"Content-Type": "application/json", "x-horoscope-cron-secret": "94c4f3fc2aff347d41b3536ea79eb1b913d59dde1e29caa4bc453079f4304237"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);