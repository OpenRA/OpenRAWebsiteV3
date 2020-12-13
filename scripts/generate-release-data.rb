require 'octokit'
require 'yaml'

def get_releases_data()
  releases = Octokit.releases('OpenRA/OpenRA');
  latest_release = releases.find { |release| release.prerelease == false }
  latest_playtest = releases.find { |release| release.prerelease == true }

  latest_release_id = latest_release[:id]

  latest_playtest_id = nil;
  if latest_playtest[:published_at] > latest_release[:published_at] then
    latest_playtest_id = latest_playtest[:id]
  end

  [latest_release_id, latest_playtest_id]
end

def get_release_key(name, tag)
  case name
    when 'OpenRA-Dune-2000-x86_64.AppImage', 'OpenRA-Dune-2000-playtest-x86_64.AppImage'
      'linux_d2k'
    when 'OpenRA-Red-Alert-x86_64.AppImage', 'OpenRA-Red-Alert-playtest-x86_64.AppImage'
      'linux_ra'
    when 'OpenRA-Tiberian-Dawn-x86_64.AppImage', 'OpenRA-Tiberian-Dawn-playtest-x86_64.AppImage'
      'linux_td'
    when 'OpenRA-' + tag + '.dmg'
      'macos'
    when 'OpenRA-' + tag + '-x64.exe'
      'windows'
    when 'OpenRA-' + tag + '-source.tar.bz2'
      'source'
    else
      'other'
  end
end

def get_release_data(release_id)
  release_data = Hash.new
  release = Octokit.release('https://api.github.com/repos/OpenRA/OpenRA/releases/' + release_id.to_s)

  release_data['tag'] = release[:tag_name]
  release_data['assets'] = Hash.new
  release['assets'].each do |asset|
    release_key = get_release_key(asset[:name], release[:tag_name])
    if release_key != 'other' then
      release_data['assets'][release_key] = Hash[
        'filename' => asset[:name],
        'download_url' => asset[:browser_download_url],
        'size' => asset[:size]
      ]
    end
  end

  release_data
end

releases_data = get_releases_data()
current_release_id = releases_data[0]
current_playtest_id = releases_data[1]

releases = Hash.new
releases['release'] = get_release_data(current_release_id)
if current_playtest_id != nil then
  releases['playtest'] = get_release_data(current_playtest_id)
end

File.open('./docs/_data/releases.yaml', 'w') {
  |file|
  YAML.dump(releases, file)
}
