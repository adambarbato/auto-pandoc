-- relative-links.lua
-- Pandoc Lua filter to convert absolute image and link paths to relative paths
-- This ensures that extracted media files use relative paths instead of absolute paths

-- Helper function to check if a path is absolute
local function is_absolute(filepath)
  if not filepath then
    return false
  end

  -- Check for Unix absolute path (starts with /)
  if filepath:sub(1, 1) == "/" then
    return true
  end

  -- Check for Windows absolute path (e.g., C:\ or \\)
  if filepath:match("^%a:[/\\]") or filepath:sub(1, 2) == "\\\\" then
    return true
  end

  return false
end

-- Helper function to extract the relative portion from an absolute path
-- This looks for common directory patterns like "media", "assets", etc.
local function extract_relative_path(filepath)
  if not filepath or filepath == "" then
    return filepath
  end

  -- Try to find "media" directory in the path and extract from there
  -- Matches: /full/path/to/media/... -> media/...
  local media_match = filepath:match("[/\\](media[/\\].+)$")
  if media_match then
    return media_match:gsub("\\", "/") -- Normalize to forward slashes
  end

  -- Try to find other common asset directories
  local asset_patterns = {
    "[/\\](assets[/\\].+)$",
    "[/\\](images[/\\].+)$",
    "[/\\](img[/\\].+)$",
    "[/\\](files[/\\].+)$",
  }

  for _, pattern in ipairs(asset_patterns) do
    local match = filepath:match(pattern)
    if match then
      return match:gsub("\\", "/")
    end
  end

  -- If no common pattern found, try to extract the last two directory levels
  -- /full/path/to/dir/file.png -> dir/file.png
  local two_levels = filepath:match("[/\\]([^/\\]+[/\\][^/\\]+)$")
  if two_levels then
    return two_levels:gsub("\\", "/")
  end

  -- Last resort: just get the filename
  local filename = filepath:match("[^/\\]+$")
  if filename then
    return filename
  end

  return filepath
end

-- Helper function to convert absolute path to relative path
local function make_relative(filepath)
  if not filepath or filepath == "" then
    return filepath
  end

  -- If already relative, return as-is
  if not is_absolute(filepath) then
    return filepath
  end

  -- Extract the relative portion from the absolute path
  local relative = extract_relative_path(filepath)

  -- Ensure the path starts with ./ for clarity
  if relative and not relative:match("^%.") then
    relative = "./" .. relative
  end

  return relative
end

-- Filter function for images
function Image(elem)
  if elem.src and is_absolute(elem.src) then
    elem.src = make_relative(elem.src)
  end
  return elem
end

-- Filter function for links
function Link(elem)
  if elem.target and is_absolute(elem.target) then
    -- Only convert if it looks like a local file (not a URL)
    if not elem.target:match("^https?://") and not elem.target:match("^ftps?://") then
      elem.target = make_relative(elem.target)
    end
  end
  return elem
end

-- Return the filters
return {
  { Image = Image },
  { Link = Link }
}
