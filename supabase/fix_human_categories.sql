-- Normalize human biology category labels in dataset snapshots and dataset items.

-- Update published datasets (mcq + kortsvar) stored in dataset_snapshots payloads.
update public.dataset_snapshots
set payload = (
  select jsonb_agg(
    case
      when lower(btrim(elem->>'category')) in ('hjerte og kredsløb', 'hjertekredsløb') then
        jsonb_set(elem, '{category}', '"Hjerte-kredsløb"')
      when lower(btrim(elem->>'category')) = 'respirationsfysiologi' then
        jsonb_set(elem, '{category}', '"Lunger"')
      when lower(btrim(elem->>'category')) in ('blod og immunsystem', 'blod og immunsystemet') then
        jsonb_set(elem, '{category}', '"Blodet og immunsystemet"')
      else elem
    end
  )
  from jsonb_array_elements(payload) elem
)
where dataset in ('mcq', 'kortsvar')
  and payload is not null;

-- Update admin dataset_items rows (category + payload + search text).
update public.dataset_items
set
  category = case
    when lower(btrim(coalesce(category, payload->>'category'))) in ('hjerte og kredsløb', 'hjertekredsløb') then
      'Hjerte-kredsløb'
    when lower(btrim(coalesce(category, payload->>'category'))) = 'respirationsfysiologi' then
      'Lunger'
    when lower(btrim(coalesce(category, payload->>'category'))) in ('blod og immunsystem', 'blod og immunsystemet') then
      'Blodet og immunsystemet'
    else category
  end,
  payload = case
    when lower(btrim(payload->>'category')) in ('hjerte og kredsløb', 'hjertekredsløb') then
      jsonb_set(payload, '{category}', '"Hjerte-kredsløb"')
    when lower(btrim(payload->>'category')) = 'respirationsfysiologi' then
      jsonb_set(payload, '{category}', '"Lunger"')
    when lower(btrim(payload->>'category')) in ('blod og immunsystem', 'blod og immunsystemet') then
      jsonb_set(payload, '{category}', '"Blodet og immunsystemet"')
    else payload
  end,
  search_text = case
    when search_text is null then null
    else regexp_replace(
      regexp_replace(
        regexp_replace(
          regexp_replace(
            search_text,
            '(?i)hjerte og kredsløb',
            'Hjerte-kredsløb',
            'g'
          ),
          '(?i)hjertekredsløb',
          'Hjerte-kredsløb',
          'g'
        ),
        '(?i)respirationsfysiologi',
        'Lunger',
        'g'
      ),
      '(?i)blod og immunsystem(et)?',
      'Blodet og immunsystemet',
      'g'
    )
  end
where dataset in ('mcq', 'kortsvar')
  and (
    lower(btrim(coalesce(category, payload->>'category'))) in (
      'hjerte og kredsløb',
      'hjertekredsløb',
      'respirationsfysiologi',
      'blod og immunsystem',
      'blod og immunsystemet'
    )
    or lower(btrim(payload->>'category')) in (
      'hjerte og kredsløb',
      'hjertekredsløb',
      'respirationsfysiologi',
      'blod og immunsystem',
      'blod og immunsystemet'
    )
  );

-- Update studio pipeline item bank (if used by the study pipeline).
update public.study_items
set category = case
  when lower(btrim(category)) in ('hjerte og kredsløb', 'hjertekredsløb') then 'Hjerte-kredsløb'
  when lower(btrim(category)) = 'respirationsfysiologi' then 'Lunger'
  when lower(btrim(category)) in ('blod og immunsystem', 'blod og immunsystemet') then 'Blodet og immunsystemet'
  else category
end
where study_id = (select id from public.studies where slug = 'human');
