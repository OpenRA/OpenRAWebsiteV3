require 'octokit'
require 'yaml'

# Github release IDs: obtain from https://api.github.com/repos/OpenRA/OpenRA/releases
GITHUB_PLAYTEST_ID = ''
GITHUB_RELEASE_ID = '26118058'

def get_release_key(name, tag)
  case name
    when 'OpenRA-Dune-2000-x86_64.AppImage', 'OpenRA-Dune-2000-playtest-x86_64.AppImage'
      'linux_dune'
    when 'OpenRA-Red-Alert-x86_64.AppImage', 'OpenRA-Red-Alert-playtest-x86_64.AppImage'
      'linux_ra'
    when 'OpenRA-Tiberian-Dawn-x86_64.AppImage', 'OpenRA-Tiberian-Dawn-playtest-x86_64.AppImage'
      'linux_td'
    when 'OpenRA-' + tag + '.dmg'
      'osx'
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
  release = Octokit.release('https://api.github.com/repos/OpenRA/OpenRA/releases/' + release_id)

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

releases = Hash.new
releases['release'] = get_release_data(GITHUB_RELEASE_ID)
if GITHUB_PLAYTEST_ID != '' then
  releases['playtest'] = get_release_data(GITHUB_PLAYTEST_ID)
end

File.open('./docs/_data/releases.yaml', 'w') {
  |file|
  YAML.dump(releases, file)
}
