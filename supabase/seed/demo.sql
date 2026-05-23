insert into public.leagues (sportmonks_id, name, short_code)
values
  (8, 'EFL Championship', 'CHA'),
  (24, 'EFL League One', 'LO'),
  (25, 'EFL League Two', 'LT'),
  (82, 'Bundesliga 2', '2BL'),
  (137, 'Serie B', 'SB')
on conflict (sportmonks_id) do update set name = excluded.name;

insert into public.players (sportmonks_id, display_name, position_name, nationality_name, hidden_gem_score)
values
  (900001, 'Elliot Warren', 'Central Midfielder', 'England', 74),
  (900002, 'Mateo Klein', 'Left Winger', 'Germany', 82),
  (900003, 'Noah Bell', 'Centre Back', 'England', 66),
  (900004, 'Lucas Ferri', 'Striker', 'Italy', 91)
on conflict (sportmonks_id) do update
set display_name = excluded.display_name,
    position_name = excluded.position_name,
    nationality_name = excluded.nationality_name,
    hidden_gem_score = excluded.hidden_gem_score;
